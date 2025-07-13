## Grocy – Technical Specification (Current PHP Implementation)

### 1. Overview
Grocy is a web-based household/ERP application covering inventory, shopping, meal-planning and task management needs.  The backend is a PHP 8.2/SQLite3 monolith that exposes a fully featured JSON REST API (documented via the included OpenAPI file `grocy.openapi.json`).  All first-party front-end functionality is implemented by consuming this API, therefore the API surface is considered *the* public contract of the system.

### 2. Functional Scope (Feature List)
1. **System / Core**  
   – Version & runtime introspection  
   – Configuration access & live change tracking  
   – Localization subsystem & missing-translation logging  
   – User/Session management, API keys, permission hierarchy
2. **Stock Management**  
   – Products catalogue  
   – Physical stock entries (FIFO/LIFO, opened vs. unopened, best-before, batch label printing)  
   – Stock transactions (consume, open, transfer, inventory corrections)  
   – Locations (fridge, freezer…​) & shopping locations  
   – Quantity units & conversions  
   – Min-stock and spoilage analytics  
   – Barcode lookup (internal + plugin based)
3. **Shopping Lists**  
   – Multiple lists (shareable)  
   – Automatically filled by min-stock or recipe fulfillment  
   – Purchase workflow → stock intake  
   – Price memory per product & statistics
4. **Recipes & Meal-Plan**  
   – Recipe editor, nesting & serving size scaling  
   – Fulfillment check against current stock  
   – Meal-plan calendar with sections (breakfast/lunch/…​)  
   – Shopping-list generation from meal-plan
5. **Chores**  
   – Recurring chores with individual assignment  
   – Frequency rules (interval, cron-like, after previous execution)  
   – Execution logging & next-due calculation  
   – Optional user-field extensions
6. **Batteries / Equipment**  
   – Batteries with charge cycle tracking, low-charge reminder  
   – Generic equipment registry (maintenance interval, notes)
7. **Tasks**  
   – Task lists & categories  
   – Due dates, assignees, recurring flag  
   – Completion logging
8. **Calendar**  
   – Aggregated iCal feed exposing chores, tasks, batteries, meal-plan etc.
9. **Files / Attachments**  
   – Arbitrary file upload attached to any entity (recipes, products…)  
   – Image handling for product pictures, recipe images
10. **Print Services**  
    – HTML/PDF generation for labels & shopping list  
    – Esc/Pos & ZPL printer support
11. **Extensibility**  
    – User-defined fields per entity  
    – Plugin system (barcode lookup, web hooks)

### 3. Data Model (Relational, SQLite)
Below is the *logical* data model (grouped by domain).  Key columns and relations only – see `/migrations` for the authoritative DDL.

#### 3.1 Core / Security
| Table | Purpose | Selected Columns |
|-------|---------|------------------|
| `users` | Login + personal settings | `id`, `username`, `password_hash`, `locale`, `first_day_of_week`, … |
| `api_keys` | Personal & system API tokens | `key`, `user_id`, `expires`, `last_used` |
| `sessions` | PHP session mirror for SSO | `session_id`, `user_id`, `expires` |
| `user_permissions`, `permission_hierarchy` | RBAC matrix | `user_id`, `permission_key`, `inherited_from` |

#### 3.2 Stock
| Table | Purpose | Selected Columns |
|-------|---------|------------------|
| `products` | Master data | `id`, `name`, `product_group_id`, `qu_id_stock`, `min_stock_amount`, … |
| `product_groups` | Grouping + default settings | `id`, `name`, `description` |
| `product_barcodes` | 1-n barcodes per product | `id`, `product_id`, `barcode`, `package_amount` |
| `quantity_units` | Units (piece, g, l…) | `id`, `name`, `name_plural` |
| `quantity_unit_conversions` | Unit → Unit factors | `id`, `from_qu_id`, `to_qu_id`, `factor` |
| `locations` | Physical storage | `id`, `name`, `is_freezer` |
| `shopping_locations` | Store information | `id`, `name` |
| `stock` | Current stock ledger | `id`, `product_id`, `amount`, `best_before_date`, `open`, `location_id`, `price`, … |
| `stock_log` | Immutable event log | `id`, `timestamp`, `transaction_type`, `difference` |
| Caches `cache__*` | Pre-computed views (avg price, next due, …) | — |

#### 3.3 Shopping Lists
| Table | Purpose | Columns |
|-------|---------|---------|
| `shopping_lists` | List header | `id`, `name` |
| `shopping_list` | Line items | `id`, `shopping_list_id`, `product_id`, `amount`, `note`, `done` |

#### 3.4 Recipes & Meal-Plan
| Table | Purpose | Columns |
|-------|---------|---------|
| `recipes` | Header | `id`, `name`, `description`, `picture_file_name` |
| `recipes_pos` | Product positions | `id`, `recipe_id`, `product_id`, `amount`, `only_check_single_unit_in_stock` |
| `recipes_nestings` | Nested sub-recipes | `parent_recipe_id`, `child_recipe_id`, `amount` |
| `meal_plan` | Calendar entries | `id`, `date`, `type`, `recipe_id`, `note` |
| `meal_plan_sections` | Optional day section definitions | `id`, `name`, `sort_order` |

#### 3.5 Chores / Batteries / Tasks / Equipment
| Table | Domain | Purpose |
|-------|--------|---------|
| `chores`, `chores_log`, `chores_assignments` | Chores | Definition, executions, dynamic assignees |
| `batteries`, `battery_charge_cycles` | Batteries | Charge tracking & reminders |
| `tasks`, `task_categories` | Tasks | Simple task/todo lists |
| `equipment` | Equipment | Asset registry + maintenance interval |

#### 3.6 Miscellaneous & Support
| Table | Purpose |
|-------|---------|
| `userfields`, `userfield_values` – dynamic additional columns  |
| `files` – central file metadata store |
| `migrations` – executed DB migrations |
| multiple `cache__*` helper views |

### 4. Integration & API
• REST endpoints are grouped by tags matching the above feature areas (see `grocy.openapi.json`).  
• All non-UI clients **must** use the API; there is no direct DB access guarantee.

### 5. Non-Functional Requirements
• Must run on low-power devices (Raspberry Pi)  
• Single-user and multi-user compatible  
• Offline-capable front-end (PWA)  
• Extension points for plugins, barcode lookup, custom JS/CSS  
• Localization via GNU gettext  
• Install & update through zip, Docker or Desktop wrapper  
• Automated DB migration on startup

*(End of document)*