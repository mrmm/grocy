# Migration Progress Tracker

This document tracks the migration of Grocy features from PHP → PocketBase (Go) + Vue 3.

Legend
- ✅ implemented & working (incl. UI)
- 🚧 scaffolded / partial (backend & store exist, UI MVP missing)
- ⏳ not yet started

| Domain | Sub-Feature | Status | Notes |
|--------|-------------|--------|-------|
| Core   | Auth (login/logout) | ✅ | PB email/pass auth; router guard; store tests |
|        | User settings | ⏳ | |
| Stock  | Products CRUD | ✅ | PB collections + UI cards |
|        | Stock entries (purchase/consume) | ✅ | FIFO logic; dialog UI |
|        | Product history | ✅ | read-only view |
| Shopping | Lists & items | ⏳ | not started |
| Recipes | CRUD + fulfillment | ⏳ | |
| Chores | Definition & execution | 🚧 | collections & endpoints added in this sprint |
| Batteries | Definition & charge cycles | 🚧 | scaffold this sprint |
| Equipment | Asset registry | 🚧 | scaffold this sprint |
| Tasks | Tasks & categories | ⏳ | |
| Calendar | iCal feed | ⏳ | |
| Files | Upload & thumbs | ⏳ | |
| Print | Labels & lists | ⏳ | |

Last updated: <!-- will be updated automatically by devs -->