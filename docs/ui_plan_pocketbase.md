## UI Implementation Plan – Grocy with PocketBase Backend

### 1. Front-end Technology Stack
| Layer | Choice | Rationale |
|-------|--------|-----------|
| Application framework | **Vue 3 + Pinia (TS)** | Modern, reactive, easy WebSocket integration, incremental upgrade path from current jQuery components. |
| Build tooling | **Vite** | Instant dev-server, automatic code-splitting, PWA plug-in. |
| Styling | **Tailwind CSS** (via UnoCSS) | Utility-first ⇒ fast prototyping, dark-mode built-in. |
| Data access | **PocketBase JS SDK** wrapped by a thin *ApiService*. | Handles auth, CRUD, realtime subscriptions. |
| State management | **Pinia stores** mirroring PB collections. | Centralises caching & offline logic. |
| Date / i18n | **Day.js** + **Vue-I18n** compiled from existing gettext files. |
| Charts / reports | **Chart.js 4** | Replaces current Chartist charts. |
| PWA / offline | **workbox-vite** | Pre-cache static assets + IndexedDB data store for offline use.

_The existing Bootstrap 5 markup can be progressively enhanced and later refactored._

### 2. Global Concerns
1. **Authentication Flow**  
   • PB email/password login (`pb.collection('users').authWithPassword`) → receive JWT & refresh token stored in IndexedDB.  
   • Auto-refresh via PB SDK’s built-in `autoRefreshToken` option.  
   • Role/permission claims injected into Pinia `auth` store.
2. **Realtime Sync**  
   • Each store subscribes to its underlying collection with:
     ```ts
     pb.collection('stock_entries').subscribe('*', (e) => store.applyPatch(e.record))
     ```
   • Debounced UI updates ensure large inventory changes stay smooth.
3. **Offline Support**  
   • CRUD requests queued in `localforage` and replayed when `navigator.onLine` recovers.  
   • PB SDK throws when offline; we wrap calls in retry helper.
4. **API Compatibility Layer**  
   • For 3rd-party plugins expecting old `/api` paths we ship an Express proxy (optional) translating REST ↔ PB.

### 3. Feature Parity Matrix
| Domain | Current Page(s) | New Components | PB Collections Used | Realtime? |
|--------|-----------------|---------------|---------------------|-----------|
| **Stock** | Stock overview, Product detail, Stock transactions | `StockDashboard.vue`, `ProductCard.vue`, `StockModal.vue` | `products`, `stock_entries`, `locations`, `quantity_units` | ✔ |
| **Shopping Lists** | Shopping list, Purchase view | `ShoppingList.vue`, `AddPurchase.vue` | `shopping_lists`, `shopping_list_items`, `stock_entries` | ✔ |
| **Recipes & Meal Plan** | Recipes list + editor, Meal-plan calendar | `RecipesGrid.vue`, `RecipeEditor.vue`, `MealCalendar.vue` | `recipes`, `recipes_pos`, `recipes_nestings`, `meal_plan`, `meal_plan_sections` | Meal calendar subscribes to `meal_plan` |
| **Chores** | Chores overview, Execution log | `ChoresTable.vue`, `ChoreRunDialog.vue` | `chores`, `chores_log`, `users` | ✔ |
| **Batteries** | Battery list, Charge cycles | `BatteryList.vue`, `BatteryCharge.vue` | `batteries`, `battery_charge_cycles` | ✔ |
| **Tasks** | Task lists, Categories | `TaskBoard.vue`, `TaskDialog.vue` | `tasks`, `task_categories` | ✔ |
| **Calendar** | iCal endpoint (read only) | `CalendarFeedLink.vue` | N/A (served by backend) | — |
| **Files** | File manager, image upload dialogs | `FileUpload.vue`, `Gallery.vue` | PB built-in file fields | ✔ |
| **System / Settings** | User settings, API key mgmt | `SettingsView.vue`, `ApiKeyPanel.vue` | `users`, `api_keys` | — |

### 4. Detailed Spec per Domain

#### 4.1 Stock
*Pinia Store*: `useStockStore.ts`
- State: `products`, `stockEntries`, derived getters `stockByProduct`, `nextDueDates`.
- Actions:
  • `purchase(payload)` – calls custom PB route `/stock/purchase`, optimistic add.  
  • `consume(payload)` – `/stock/consume`.
- Subscriptions: listen on `stock_entries`, `products`.
- UI Flow: `StockDashboard` lists products; clicking shows `ProductCard` with tabs (Info, Stock, History).

#### 4.2 Shopping List
*Store*: `useShoppingStore.ts`
- CRUD via `shopping_list_items` collection.  
- Auto-fill cron writes directly; subscription keeps UI current.
- `AddPurchase.vue` triggers `useStockStore.purchase` and then marks item done.

#### 4.3 Recipe & Meal Plan
*Store*: `useRecipeStore.ts`
- Fetch `recipes` (+ expand `recipes_pos.product_id`) with `?expand` to avoid N+1.  
- Fulfillment check uses custom route `/recipes/:id/fulfill`.
*Store*: `useMealPlanStore.ts` – uses `meal_plan` collection.
- Calendar rendered via `FullCalendar` component, drag & drop editing -> live DB update.

#### 4.4 Chores
*Store*: `useChoresStore.ts`
- Display `chores` with derived `next_execution` field expanded from scheduler hook stored in collection property.
- Execution action posts to `/chores/:id/execute` route (hook updates `chores_log` & next).

#### 4.5 Batteries / Equipment
Similar pattern; maintain subscriptions and computed due dates client-side for responsive UI.

#### 4.6 Tasks
*Store*: `useTaskStore.ts` mapping to `tasks`.  Kanban layout (Pinia keeps order).

### 5. Component Library & Re-Use
• Build a library `@grocy/ui` with atoms (Button, Input, Modal, Card) and organisms.  
• Use Storybook for visual regression tests.

### 6. Testing Strategy
1. **Unit Tests** – Vitest covering stores and helper utilities.  
2. **Component Tests** – Cypress Component mode.  
3. **E2E Tests** – Cypress connecting to PB in CI container, seeded with demo DB.  
4. **Contract Tests** – ensure custom PB routes match schema of legacy API.

### 7. Roll-out Plan
| Step | Description | Front-end Impact |
|------|-------------|------------------|
| 1 | Introduce PB SDK + auth store in existing UI (feature-flag). | Minimal; behind toggle. |
| 2 | Port Stock pages to new stores/components. | Users can opt-in (Beta). |
| 3 | Port Shopping List & Purchase flow. | — |
| 4 | Recipes & Meal Plan. | — |
| 5 | Chores, Batteries, Tasks. | Remove old AJAX helpers. |
| 6 | Switch default backend to PB; keep PHP proxy fallback until parity proven. | — |

Total UI rewrite effort ≈ **10–12 weeks** parallel to backend work.

### 8. Open Issues / Research
• Evaluate `dexie` for more robust IndexedDB sync.  
• Evaluate streaming large expand queries – may need pagination.  
• Accessibility (WCAG 2.1) – current UI lacks ARIA roles.

*(End of document)*