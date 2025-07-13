package hooks

import (
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
)

type purchasePayload struct {
	ProductID string  `json:"product_id"`
	Amount    float64 `json:"amount"`
	Price     float64 `json:"price"`
}

func RegisterStockHooks(app *pocketbase.PocketBase) {
	app.OnServe().BindFunc(func(e *core.ServeEvent) error {
		e.Router.POST("/stock/purchase", func(re *core.RequestEvent) error {
			var body purchasePayload
			if err := json.NewDecoder(re.Request.Body).Decode(&body); err != nil {
				return re.String(http.StatusBadRequest, `{"error": "`+err.Error()+`"}`)
			}

			if body.Amount <= 0 {
				return re.String(http.StatusBadRequest, `{"error": "amount must be > 0"}`)
			}

			// Get collection from app
			stockCollection, err := re.App.FindCollectionByNameOrId("stock_entries")
			if err != nil {
				return re.String(http.StatusInternalServerError, `{"error": "`+err.Error()+`"}`)
			}

			err = re.App.RunInTransaction(func(txApp core.App) error {
				entry := core.NewRecord(stockCollection)
				entry.Set("product_id", body.ProductID)
				entry.Set("amount", body.Amount)
				entry.Set("price", body.Price)
				entry.Set("purchased_date", time.Now())

				if err := txApp.Save(entry); err != nil {
					return err
				}

				// Update product stock
				product, err := txApp.FindRecordById("products", body.ProductID)
				if err != nil {
					return err
				}

				currentStock := product.GetFloat("stock_amount")
				product.Set("stock_amount", currentStock+body.Amount)

				return txApp.Save(product)
			})

			if err != nil {
				return re.String(http.StatusInternalServerError, `{"error": "`+err.Error()+`"}`)
			}

			return re.String(http.StatusOK, `{"success": true}`)
		})

		e.Router.POST("/stock/consume", func(re *core.RequestEvent) error {
			var body purchasePayload
			if err := json.NewDecoder(re.Request.Body).Decode(&body); err != nil {
				return re.String(http.StatusBadRequest, `{"error": "`+err.Error()+`"}`)
			}

			if body.Amount <= 0 {
				return re.String(http.StatusBadRequest, `{"error": "amount must be > 0"}`)
			}

			// Get collection from app
			stockCollection, err := re.App.FindCollectionByNameOrId("stock_entries")
			if err != nil {
				return re.String(http.StatusInternalServerError, `{"error": "`+err.Error()+`"}`)
			}

			err = re.App.RunInTransaction(func(txApp core.App) error {
				// Check current stock
				product, err := txApp.FindRecordById("products", body.ProductID)
				if err != nil {
					return err
				}

				currentStock := product.GetFloat("stock_amount")
				if currentStock < body.Amount {
					return errors.New("insufficient stock")
				}

				// Create consumption entry
				entry := core.NewRecord(stockCollection)
				entry.Set("product_id", body.ProductID)
				entry.Set("amount", -body.Amount) // Negative for consumption
				entry.Set("consumed_date", time.Now())

				if err := txApp.Save(entry); err != nil {
					return err
				}

				// Update product stock
				product.Set("stock_amount", currentStock-body.Amount)
				return txApp.Save(product)
			})

			if err != nil {
				return re.String(http.StatusInternalServerError, `{"error": "`+err.Error()+`"}`)
			}

			return re.String(http.StatusOK, `{"success": true}`)
		})

		e.Router.GET("/stock/products", func(re *core.RequestEvent) error {
			records, err := re.App.FindRecordsByFilter("products", "", "", 0, 0)
			if err != nil {
				return re.String(http.StatusInternalServerError, `{"error": "`+err.Error()+`"}`)
			}

			var products []map[string]any
			for _, record := range records {
				products = append(products, map[string]any{
					"id":           record.Id,
					"name":         record.GetString("name"),
					"stock_amount": record.GetFloat("stock_amount"),
					"min_stock":    record.GetFloat("min_stock"),
				})
			}

			// Convert to JSON manually
			jsonData, err := json.Marshal(products)
			if err != nil {
				return re.String(http.StatusInternalServerError, `{"error": "`+err.Error()+`"}`)
			}

			return re.String(http.StatusOK, string(jsonData))
		})

		return e.Next()
	})
}
