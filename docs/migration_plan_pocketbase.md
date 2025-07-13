## Migration Plan – PHP → PocketBase (Go) Re-implementation of Grocy

### 0. Why PocketBase?
PocketBase (PB) is a lightweight, self-hosted BaaS written in Go that bundles:
• SQLite persistence (same DB as Grocy today).  
• Auth (email/password, OAuth2, JWT) + rule-based access policies.  
• Realtime subscriptions (WebSocket).  
• File storage, image thumbnails, cloud functions (Go hooks).  
• Admin UI, migrations, SDKs.

Using PB lets us **outsource** generic CRUD, auth, file handling and focus on the domain-specific logic (stock calculations, recipe fulfilment, chores scheduler).  The final artefact remains a **single static binary** cross-compilable like pure Go.

### 1. High-Level Architecture
```
 grocy-pb/
   pb_data/        ← SQLite + uploaded files (same volume concept as current `data/`)
   migrations/     ← PocketBase collection schema JSON
   hooks/
     stock.go      ← transactional stock operations
     chores.go     ← due-date calculation, cron integration
     recipes.go    ← fulfilment helpers
   public/         ← embedded Vue/JS frontend (unchanged)
   main.go         ← boot PB + register hooks + custom routes
```

PB acts as the **core API server**.  Custom domain endpoints are registered via `app.OnBeforeServe(func (e *core.ServeEvent) {...})` and implemented with normal Go handlers that can freely interact with PB collections through the `dao` layer, keeping transactions inside the same SQLite connection.

### 2. Mapping Existing Tables → PocketBase Collections
| Legacy Table | PB Collection | Notes |
|--------------|--------------|-------|
| `users` | `users` (built-in) | Migrate passwords (bcrypt) and roles → `@collection.rules` |
| `products` | `products` | 1-n relation to `product_barcodes`, `location_id`, etc. |
| `product_barcodes` | `product_barcodes` | Linked via `product_id` field |
| `stock` | `stock_entries` | Keep same fields; add PB "Expand" rules to join refs easily |
| `stock_log` | `stock_log` | Keep immutable, write only from hook |
| `locations`, `shopping_locations`, `quantity_units` | identical collections |
| `shopping_lists`, `shopping_list` | `shopping_lists`, `shopping_list_items` |
| `recipes`, `recipes_pos`, `recipes_nestings` | idem |
| `chores`, `chores_log` | idem |
| `batteries`, `battery_charge_cycles` | idem |
| `tasks`, `task_categories` | idem |
| `files` | PB built-in `*_file` fields → removes custom table |
| `userfields` / `userfield_values` | Could be modelled as PB JSON field or separate `userfields` collection |

PocketBase supports **relations, cascades and expand**; therefore complex joins needed by the REST API can be served in a single call with `?expand=...` query parameter.

### 3. Domain Logic Implementation Strategy
1. **Stock Transactions**  
   • Define a REST route `/stock/consume` in a ServeEvent handler.  
   • Inside handler perform validation + create `stock_log` + update `stock_entries` in a single DB transaction (`dao.RunInTransaction`).
2. **Shopping List Autofill & Min-Stock**  
   • Nightly cron (using Go `cron` lib) inside hook reads products where `stock_amount < min_stock_amount` and inserts needed items.  
   • Cron is registered via `app.OnBeforeServe` (keeps single process).
3. **Recipe Fulfilment**  
   • Pure Go function querying PB via DAO; exposed at `/recipes/:id/fulfill` returning same JSON as original API.
4. **Chores Scheduler**  
   • Chore execution end-points: on log insert → trigger hook to calculate next due date.  
   • Daily cron updates overdue chores.
5. **RBAC**  
   • Use PB **Collection Rules** for per-role CRUD, supplemented by handler-level checks for complex conditions.
6. **Files / Pictures**  
   • Switch product/recipe images to PB file field; thumbnails auto-generated.
7. **Realtime Events**  
   • PB broadcasts collection changes via WebSocket; front-end can subscribe to `stock_entries` to update counts live.

### 4. Data Migration Procedure
1. **Export** existing `grocy.db`.  
2. Spin-up empty PocketBase (`grocy_pb.db`).  
3. Run one-off Go script:
   ```go
   src, _ := sql.Open("sqlite3", "grocy.db")
   tgt := dao.DB() // PocketBase dao
   // iterate tables, INSERT OR IGNORE into PB collections
   ```
4. Verify counts; run integrity tests.

### 5. API Compatibility Layer
• Keep **original endpoint paths** where feasible by registering custom routes that wrap PB CRUD or run complex logic.  
• Where PB auto-generated `/api/collections/<name>` endpoints already match, deprecate original routes but alias for 302 redirect.

### 6. Deployment & Operations
• Build with `go install github.com/pocketbase/pocketbase@latest` then `go build -tags sqlite_fts`.  
• Custom binary (`grocy-pb`) vendor-includes PB (`github.com/pocketbase/pocketbase`) + hooks.  
• Release artefacts: single ~15-20 MB binary + `pb_data` pre-seeded with empty schema.  
• Docker: `FROM scratch` with binary + static assets.

### 7. Timeline (Incremental)
| Phase | Effort |
|-------|--------|
| PocketBase scaffolding, collection schema, user migration | **1 w** |
| Stock & locations domain hooks | **2 w** |
| Shopping list + recipe endpoints | **2 w** |
| Chores, batteries, tasks hooks | **2 w** |
| Cron jobs, realtime subscriptions, RBAC rules | **1 w** |
| Data migration tooling & scripts | **1 w** |
| QA, contract tests vs. PHP API | **2 w** |
| Packaging, docs, beta | **1 w** |
| **Total** | **12–13 weeks** |

### 8. Open Points
• PocketBase still lacks built-in **nested transactions** – verify needs for complex stock operations.  
• Consider eventual move to PostgreSQL (`pb --sqlite=false` flag not yet supported).  
• Plugin ecosystem smaller than raw Go; heavy hooks could recreate complexity.

*(End of document)*