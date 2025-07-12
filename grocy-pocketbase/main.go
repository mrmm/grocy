package main

import (
	"log"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"

	"grocy-pocketbase/hooks"
)

func main() {
	app := pocketbase.New()

	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
		hooks.RegisterStockRoutes(app, e)
		hooks.RegisterUserSettings(app, e)
		hooks.RegisterChores(app, e)
		return nil
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}