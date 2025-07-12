package hooks

import (
  "net/http"

  "github.com/labstack/echo/v5"
  "github.com/pocketbase/pocketbase"
  "github.com/pocketbase/pocketbase/core"
  "github.com/pocketbase/pocketbase/models"
)

func RegisterUserSettings(app *pocketbase.PocketBase, e *core.ServeEvent) {
  group := e.Router.Group("/user")

  // GET /user/settings
  group.GET("/settings", func(c echo.Context) error {
    user, ok := c.Get("user").(*models.Record) // set by PB auth middleware
    if !ok || user == nil {
      return echo.NewHTTPError(http.StatusUnauthorized)
    }
    rec, err := app.Dao().FindFirstRecordByFilter("user_settings", "user = {:user}", echo.Map{"user": user.Id})
    if err != nil {
      // if not found – return empty object
      return c.JSON(http.StatusOK, echo.Map{"settings": map[string]any{}})
    }
    return c.JSON(http.StatusOK, rec.Get("settings"))
  })

  // PUT /user/settings  { settings: { … } }
  group.PUT("/settings", func(c echo.Context) error {
    user, ok := c.Get("user").(*models.Record)
    if !ok || user == nil {
      return echo.NewHTTPError(http.StatusUnauthorized)
    }

    var body struct{ Settings map[string]any `json:"settings"` }
    if err := c.Bind(&body); err != nil {
      return echo.NewHTTPError(http.StatusBadRequest, err.Error())
    }

    dao := app.Dao()
    rec, err := dao.FindFirstRecordByFilter("user_settings", "user = {:user}", echo.Map{"user": user.Id})
    if err != nil {
      // create new
      rec = models.NewRecord("user_settings")
      rec.Set("user", user.Id)
    }
    rec.Set("settings", body.Settings)
    if err := dao.SaveRecord(rec); err != nil {
      return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
    }
    return c.JSON(http.StatusOK, echo.Map{"ok": true})
  })
}