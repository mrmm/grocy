# Grocy PocketBase Backend (Stage 1 – Stock Management)

## Prerequisites
- Go 1.21+

## Getting Started
```bash
# navigate to the new backend folder
cd grocy-pocketbase

# install deps & run
go run .
```
The server starts on `http://127.0.0.1:8090` (PocketBase default).  Visit `/` to open the PB Admin UI, import `migrations/001_init_collections.json` or create the collections manually, then create an admin user.

## Custom Routes
- **POST /stock/purchase** – Purchase a product into stock.
- **POST /stock/consume** – Consume stock using FIFO logic.

See `hooks/stock.go` for payload details.

## Next Steps
- Wire the Vue 3 front-end in `/web` (to be added).
- Extend hooks for inventory corrections and transfers.
- Add tests and CI workflow.

## Front-end (Vue 3)

```bash
cd grocy-pocketbase/web
npm install  # installs Vue 3, Pinia, Vite, Vitest, Cypress, etc.
npm run dev  # http://localhost:5173
```

### Useful npm scripts
- `npm run dev` – Vite dev server
- `npm run build` – production build to `dist/`
- `npm run test` – run unit tests via Vitest
- `npm run e2e` – open Cypress test runner (placeholder)

The app expects the PocketBase backend to run on `http://127.0.0.1:8090`. Override with `VITE_PB_URL` env var.

### Module overview
- `src/stores/*` – Pinia stores (products, stock)
- `src/components/*` – UI components
- `src/views/*` – routed pages
- `tests/` – Vitest unit tests

*(End of document)*