package hooks

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
)

func RegisterChores(app *pocketbase.PocketBase, e *core.ServeEvent) {
	group := e.Router.Group("/chores")

	// POST /chores/:id/execute  { done_time?: ISO }
	group.POST("/{id}/execute", func(re *core.RequestEvent) error {
		id := re.Request.PathValue("id")
		var body struct {
			DoneTime string `json:"done_time"`
		}

		if err := json.NewDecoder(re.Request.Body).Decode(&body); err != nil {
			return re.String(http.StatusBadRequest, `{"error": "`+err.Error()+`"}`)
		}

		// Get collection from app
		choreLogCollection, err := re.App.FindCollectionByNameOrId("chores_log")
		if err != nil {
			return re.String(http.StatusInternalServerError, `{"error": "`+err.Error()+`"}`)
		}

		err = re.App.RunInTransaction(func(txApp core.App) error {
			chore, err := txApp.FindRecordById("chores", id)
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
			log := core.NewRecord(choreLogCollection)
			log.Set("chore", id)
			log.Set("done_time", doneTime)
			if err := txApp.Save(log); err != nil {
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
			return txApp.Save(chore)
		})

		if err != nil {
			return re.String(http.StatusInternalServerError, `{"error": "`+err.Error()+`"}`)
		}

		return re.String(http.StatusOK, `{"ok": true}`)
	})
}
