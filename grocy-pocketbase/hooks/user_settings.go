package hooks

import (
	"encoding/json"
	"net/http"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
)

func RegisterUserSettings(app *pocketbase.PocketBase, e *core.ServeEvent) {
	group := e.Router.Group("/user")

	// GET /user/settings
	group.GET("/settings", func(re *core.RequestEvent) error {
		user, ok := re.Get("user").(*core.Record) // set by PB auth middleware
		if !ok || user == nil {
			return re.String(http.StatusUnauthorized, `{"error": "unauthorized"}`)
		}

		rec, err := re.App.FindFirstRecordByFilter("user_settings", "user = {:user}", map[string]any{"user": user.Id})
		if err != nil {
			// if not found – return empty object
			return re.String(http.StatusOK, `{"settings": {}}`)
		}

		// Convert settings to JSON
		settings := rec.Get("settings")
		jsonData, err := json.Marshal(settings)
		if err != nil {
			return re.String(http.StatusInternalServerError, `{"error": "`+err.Error()+`"}`)
		}

		return re.String(http.StatusOK, string(jsonData))
	})

	// PUT /user/settings  { settings: { … } }
	group.PUT("/settings", func(re *core.RequestEvent) error {
		user, ok := re.Get("user").(*core.Record)
		if !ok || user == nil {
			return re.String(http.StatusUnauthorized, `{"error": "unauthorized"}`)
		}

		var body struct {
			Settings map[string]any `json:"settings"`
		}
		if err := json.NewDecoder(re.Request.Body).Decode(&body); err != nil {
			return re.String(http.StatusBadRequest, `{"error": "`+err.Error()+`"}`)
		}

		// Get collection from app
		userSettingsCollection, err := re.App.FindCollectionByNameOrId("user_settings")
		if err != nil {
			return re.String(http.StatusInternalServerError, `{"error": "`+err.Error()+`"}`)
		}

		rec, err := re.App.FindFirstRecordByFilter("user_settings", "user = {:user}", map[string]any{"user": user.Id})
		if err != nil {
			// create new
			rec = core.NewRecord(userSettingsCollection)
			rec.Set("user", user.Id)
		}
		rec.Set("settings", body.Settings)
		if err := re.App.Save(rec); err != nil {
			return re.String(http.StatusInternalServerError, `{"error": "`+err.Error()+`"}`)
		}

		return re.String(http.StatusOK, `{"ok": true}`)
	})
}
