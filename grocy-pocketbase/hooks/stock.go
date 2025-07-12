package hooks

import (
	"net/http"
	"time"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/daos"
	"github.com/pocketbase/pocketbase/models"
)

// purchasePayload represents the expected body for /stock/purchase
type purchasePayload struct {
	ProductId  string  `json:"productId"`
	Amount     float64 `json:"amount"`
	LocationId string  `json:"locationId"`
	BestBefore string  `json:"bestBefore"`
}

type consumePayload struct {
	ProductId string  `json:"productId"`
	Amount    float64 `json:"amount"`
}

func RegisterStockRoutes(app *pocketbase.PocketBase, e *core.ServeEvent) {
	e.Router.POST("/stock/purchase", func(c echo.Context) error {
		var body purchasePayload
		if err := c.Bind(&body); err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, err.Error())
		}

		if body.Amount <= 0 {
			return echo.NewHTTPError(http.StatusBadRequest, "amount must be > 0")
		}

		// optional best-before parsing
		var bestBefore time.Time
		if body.BestBefore != "" {
			t, err := time.Parse("2006-01-02", body.BestBefore)
			if err != nil {
				return echo.NewHTTPError(http.StatusBadRequest, "bestBefore must be YYYY-MM-DD")
			}
			bestBefore = t
		}

		dao := app.Dao()
		err := dao.RunInTransaction(func(txDao *daos.Dao) error {
			entry := models.NewRecord("stock_entries")
			entry.Set("product", body.ProductId)
			entry.Set("location", body.LocationId)
			entry.Set("amount", body.Amount)
			if !bestBefore.IsZero() {
				entry.Set("best_before", bestBefore)
			}
			entry.Set("purchased_date", time.Now())

			if err := txDao.SaveRecord(entry); err != nil {
				return err
			}

			logRec := models.NewRecord("stock_log")
			logRec.Set("timestamp", time.Now())
			logRec.Set("type", "PURCHASE")
			logRec.Set("product", body.ProductId)
			logRec.Set("amount", body.Amount)

			return txDao.SaveRecord(logRec)
		})

		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
		}

		return c.JSON(http.StatusOK, map[string]any{"status": "ok"})
	})

	e.Router.POST("/stock/consume", func(c echo.Context) error {
		var body consumePayload
		if err := c.Bind(&body); err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, err.Error())
		}

		if body.Amount <= 0 {
			return echo.NewHTTPError(http.StatusBadRequest, "amount must be > 0")
		}

		dao := app.Dao()

		// helper closure that returns error so we can handle custom message
		err := dao.RunInTransaction(func(txDao *daos.Dao) error {
			remain := body.Amount

			// select entries FIFO by purchased_date asc
			entries := []*models.Record{}
			txDao.DB().Select().
				From("stock_entries").
				Where(dbx.HashExp{"product": body.ProductId}).
				OrderBy("purchased_date ASC").
				All(&entries)

			for _, rec := range entries {
				amt := rec.GetFloat("amount")
				if amt >= remain {
					rec.Set("amount", amt-remain)
					if rec.GetFloat("amount") == 0 {
						if err := txDao.DeleteRecord(rec); err != nil {
							return err
						}
					} else {
						if err := txDao.SaveRecord(rec); err != nil {
							return err
						}
					}
					remain = 0
					break
				} else {
					remain -= amt
					if err := txDao.DeleteRecord(rec); err != nil {
						return err
					}
				}
			}

			if remain > 0 {
				return echo.NewHTTPError(http.StatusBadRequest, "not enough stock")
			}

			logRec := models.NewRecord("stock_log")
			logRec.Set("timestamp", time.Now())
			logRec.Set("type", "CONSUME")
			logRec.Set("product", body.ProductId)
			logRec.Set("amount", -body.Amount)

			return txDao.SaveRecord(logRec)
		})

		if err != nil {
			if he, ok := err.(*echo.HTTPError); ok {
				return he
			}
			return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
		}

		return c.JSON(http.StatusOK, map[string]any{"status": "ok"})
	})
}