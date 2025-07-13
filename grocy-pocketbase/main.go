package main

import (
	"log"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"

	"grocy-pocketbase/hooks"
)

func main() {
	app := pocketbase.New()

	app.OnServe().BindFunc(func(e *core.ServeEvent) error {
		hooks.RegisterStockHooks(app)
		hooks.RegisterUserSettings(app, e)
		hooks.RegisterChores(app, e)
		hooks.RegisterBatteries(app, e)
		return e.Next()
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
