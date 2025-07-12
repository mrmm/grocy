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

func RegisterChores(app *pocketbase.PocketBase, e *core.ServeEvent) {
  group := e.Router.Group("/chores")

  // POST /chores/:id/execute  { done_time?: ISO }
  group.POST("/:id/execute", func(c echo.Context) error {
    id := c.PathParam("id")
    var body struct{ DoneTime string `json:"done_time"` }
    _ = c.Bind(&body)

    dao := app.Dao()
    err := dao.RunInTransaction(func(txDao *daos.Dao) error {
      chore, err := txDao.FindRecordById("chores", id)
      if err != nil {
        return err
      }

      doneTime := time.Now()
      if body.DoneTime != "" {
        if t, err := time.Parse("2006-01-02", body.DoneTime); err == nil {
          doneTime = t
        }
      }

      // insert log
      log := models.NewRecord("chores_log")
      log.Set("chore", id)
      log.Set("done_time", doneTime)
      if err := txDao.SaveRecord(log); err != nil {
        return err
      }

      // calc next_execution simple: days interval
      periodType := chore.GetString("period_type")
      days := int64(chore.GetFloat("period_config"))
      next := doneTime
      if periodType == "days" && days > 0 {
        next = next.AddDate(0, 0, int(days))
      }
      chore.Set("next_execution", next)
      return txDao.SaveRecord(chore)
    })
    if err != nil {
      if dbx.IsErrNotFound(err) {
        return echo.NewHTTPError(http.StatusNotFound, err.Error())
      }
      return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
    }
    return c.JSON(http.StatusOK, echo.Map{"ok": true})
  })
}