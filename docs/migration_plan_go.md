## Migration Plan – PHP → Go Re-implementation of Grocy

### 1. Guiding Principles
• **Feature Parity First** – Keep the publicly documented REST API identical; this shields the web-frontend and 3rd-party tools from change.  
• **Iterative + Module-by-Module** – Rewrite service after service (Stock → Shopping List → Recipes…​) while running the Go backend in *proxy* mode for yet-unported routes.  
• **Use Off-The-Shelf Building Blocks** to reduce bespoke code (GORM, Gin, go-i18n, go-chi/httprate).  
• **Preserve SQLite Schema** – Re-use the existing migrations verbatim so users can drop-in their `data/grocy.db`.

### 2. High-Level Architecture in Go
```
 cmd/grocyd/main.go
 internal/
   api/          ← gin route handlers (one file per controller)
   service/      ← domain logic (StockService, …)  
   repo/         ← GORM models + queries  
   i18n/         ← gettext PO → json compiled at build time  
   middleware/   ← auth, RBAC, logging, panic-recovery
 pkg/
   openapi/      ← generated spec & client  
 migrations/     ← *.sql copied from current repo
 web/            ← embedded Vue/JS assets (via go:embed)
```

### 3. Detailed Steps
1. **Bootstrap**  
   ```bash
   go mod init github.com/grocy/grocy-go
   go get github.com/gin-gonic/gin gorm.io/gorm gorm.io/driver/sqlite ...
   ```
2. **Data Layer**  
   • Generate GORM models mapping *exactly* to current tables (use `gorm` struct tags).  
   • Ship existing `/migrations` folder and run them via `pressly/goose` on startup.
3. **Auth & Security**  
   • Port password hashing (bcrypt) & session cookie semantics.  
   • Implement middleware reproducing `ApiKeyService` & `SessionService`.
4. **Generic Entity Endpoints**  
   • Build a reflection-based handler reproducing `/objects/:entity` CRUD.  
   • Use it temporarily for rapid parity.
5. **Domain Services**  
   – Re-implement **StockService** focusing on: consume, purchase, inventory, spoilage logic.  (Unit-tested extensively.)  
   – Next: `ShoppingListService`, `RecipesService`, `ChoresService`, etc.
6. **Controllers / Routes**  
   • Mirror PHP API paths (`/stock/add`, `/recipes/fulfill/:id` …).  
   • Return identical JSON including error codes/fields.
7. **Background Jobs**  
   • Use `robfig/cron/v3` for daily spoilage calculation, chore due-date propagation.
8. **Internationalization**  
   • Convert GNU PO files to `toml`/`json` with `gotext` → load at runtime.
9. **Plugins & Extensibility**  
   • Expose event bus over HTTP webhooks; re-compile-time Go plugins are optional.
10. **Testing & Verification**  
    • Spin up *contract tests* running original PHP and new Go back-to-back, asserting equivalence of JSON outcomes on a seeded demo DB.  
    • Migrate existing Cypress UI tests to speak to Go backend.
11. **Deployment Pipeline**  
    • GitHub Actions matrix builds (linux/amd64, linux/arm/v7, windows).  
    • Produce Docker image (`FROM scratch` + static binary) and `.zip` artefact.
12. **Cut-over Strategy**  
    a. Release *beta* with dual-backend mode (`--proxy-to-php=http://127.0.0.1:9301`).  
    b. Encourage community dog-food.  
    c. Remove proxy once parity is proven.

### 4. Rough Time Estimate (1 senior engineer)
| Milestone | Effort |
|-----------|--------|
| Project scaffolding, auth, migrations | **2 w** |
| Stock + shopping list domain | **4 w** |
| Recipes + meal-plan | **2 w** |
| Chores, batteries, tasks | **3 w** |
| Calendar, files, print | **2 w** |
| Plugin/event system & polish | **2 w** |
| Testing, CI/CD, docs, beta feedback | **3 w** |
| **Total** | **18–20 weeks** |

> *Note:* Community translation files, front-end build pipeline and desktop wrapper (Electron) are unaffected and can be kept as-is.

### 5. Open Questions / Future Enhancements
• Replace SQLite with optional Postgres for multi-user / high-concurrency setups?  
• GraphQL endpoint in addition to REST?  
• Move from Vue 2 to Vue 3 in same rewrite window.

*(End of document)*