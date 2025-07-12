## Stage 1 – Stock Management MVP (PocketBase + Vue 3)

This document defines the **very first increment** for the PocketBase + Vue 3 rewrite of Grocy.  Focus: deliver end-to-end CRUD & realtime views for **products and stock entries** (feature group #2 in the overall roadmap).

### 1. PocketBase Schema

#### 1.1 Collections & Fields
(Use the PB Admin UI or JSON migrations in `migrations/`.)

1. **`quantity_units`**  
   | Field | Type | Options | Notes |
   |-------|------|---------|-------|
   | `name` | text | req, unique | e.g. “Piece” |
   | `name_plural` | text | req | |
   | `plural_forms` | text | optional | JSON string from ICU |

2. **`locations`**  
   | Field | Type | Options | Notes |
   |-------|------|---------|-------|
   | `name` | text | req, unique | “Fridge”, “Pantry” |
   | `is_freezer` | bool | default: false | |

3. **`products`**  
   | Field | Type | Options | Notes |
   |-------|------|---------|-------|
   | `name` | text | req | |
   | `description` | text | | markdown supported |
   | `location` | relation → `locations` | req | default storage |
   | `qu_stock` | relation → `quantity_units` | req | stock unit |
   | `min_stock_amount` | number | default 0 | |
   | `picture` | file | thumb: 256px | optional |

4. **`stock_entries`**  (child of products)  
   | Field | Type | Options | Notes |
   |-------|------|---------|-------|
   | `product` | relation → `products` | req | |
   | `location` | relation → `locations` | req | where stored |
   | `amount` | number | req | decimal allowed |
   | `best_before` | date | | |
   | `purchased_date` | date | | default now |
   | `open` | bool | default false | |

5. **`stock_log`** (write-only; created by hooks)  
   | Field | Type | Notes |
   |-------|------|-------|
   | `timestamp` | dateTime | server-side now |
   | `type` | text | `PURCHASE`, `CONSUME`, `INVENTORY_CORRECTION` |
   | `product` | relation | |
   | `amount` | number | signed (- = out) |
   | `note` | text | optional |

#### 1.2 Collection Rules
• `products`, `locations`, `quantity_units` – `@auth.role = "admin"` for create/update, read open.  
• `stock_entries` – create/update by authenticated users; delete only inside hook to keep audit.

### 2. Custom Hooks & Routes
File: `hooks/stock.go`

```go
// POST /stock/purchase
// body: {productId, amount, locationId, bestBefore, price}
// 1. create stock_entries row
// 2. append stock_log row
// 3. return 200 + new entry

// POST /stock/consume
// body: {productId, amount}
// 1. pick oldest stock_entries (FIFO) -> deduct amount, delete if zero
// 2. append stock_log row (amount negative)
// 3. return remaining stock for product
```
Both endpoints wrapped in `dao.RunInTransaction()`.

### 3. Vue 3 Front-end

#### 3.1 Routing (Vue Router)
| Path | View Component |
|------|----------------|
| `/stock` | `StockDashboard.vue` |
| `/products/:id` | `ProductDetail.vue` |
| `/purchase` | `PurchaseDialog.vue` (modal route) |

#### 3.2 Pinia Stores
1. `useUnitStore` – lazy-load quantity units.  
2. `useLocationStore` – lazy-load locations.  
3. `useProductStore`  
   • state: `products`, `loading`.  
   • action `fetch()` uses `pb.collection('products').getFullList({ expand: 'location,qu_stock' })`.  
   • subscribe to collection for realtime.
4. `useStockStore`  
   • state: `stockEntries`, getters `byProduct(id)` & `totalAmount(id)`.  
   • action `purchase(payload)` → POST `/stock/purchase`.  
   • action `consume(payload)` → POST `/stock/consume`.

#### 3.3 Components
| Component | Purpose |
|-----------|---------|
| `ProductList.vue` | Table or masonry cards of all products (thumbnail + amount badge). |
| `ProductCard.vue` | Shown in list; emits `open-detail`. |
| `ProductDetail.vue` | Tabs: Info, Stock entries (DataTable), History (log).  Allows consume/purchase actions. |
| `PurchaseDialog.vue` | Form: product picker, amount, location, best-before; calls store action. |
| `ConsumeDialog.vue` | Form: product picker, amount; calls store action. |
| `StockBadge.vue` | Reactive badge showing `useStockStore.totalAmount` per product. |

#### 3.4 UI Flow
1. User navigates to `/stock` → `ProductList` renders.  
2. Real-time updates from PB adjust `StockBadge` values instantly.  
3. Clicking “+” FAB opens `PurchaseDialog` which persists to PB and updates list optimistically.  
4. Inside `ProductDetail`, user sees latest entries; can *consume* which deducts using FIFO.

### 4. Validation & Testing
1. **Unit tests** – Vitest for stores; mock PB SDK.  
2. **Component tests** – Cypress CT for `ProductList` and dialogs.  
3. **E2E** – Cypress: seed PB with fixture data, run purchase & consume, assert counts and DB rows.

### 5. Deliverables
• JSON migration creating the five collections above.  
• `hooks/stock.go` implementing two endpoints.  
• Vue project bootstrapped with Vite, Pinia, Tailwind; pages & components listed.  
• Tests + GitHub Action running headless.

### 6. Timeline (2 Weeks Sprint)
| Day | Task |
|-----|------|
| 1 | PB collections & rules; commit migration JSON. |
| 2 | Scaffold Vite + Vue project; set up auth store. |
| 3 | Implement `useUnitStore`, `useLocationStore`. |
| 4–5 | `useProductStore`, `ProductList.vue`, realtime wiring. |
| 6 | Build `hooks/stock.go` + purchase endpoint. |
| 7 | Build `PurchaseDialog.vue`; wire action. |
| 8 | Consume endpoint + dialog. |
| 9 | `ProductDetail.vue`, stock table. |
| 10 | Tests + CI + polish. |

*(End of document)*