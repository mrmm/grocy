# Migration Progress Tracker

This document tracks the migration of Grocy features from PHP → PocketBase (Go) + Vue 3.

Legend
- ✅ implemented & working (incl. UI)
- 🚧 scaffolded / partial (backend & store exist, UI MVP missing)
- ⏳ not yet started

| Domain | Sub-Feature | Status | Notes |
|--------|-------------|--------|-------|
| Core   | Auth (login/logout) | ✅ | PB email/pass auth; router guard; **unit tests added** |
|        | User settings | 🚧 | backend & store scaffolded, tests pending |
| Stock  | Products CRUD | ✅ | PB collections + UI cards; **store + component tests** |
|        | Stock entries (purchase/consume) | ✅ | FIFO logic; dialog UI; **store tests** |
|        | Product history | ✅ | read-only view (tests TBD) |
| Shopping | Lists & items | ⏳ | not started |
| Recipes | CRUD + fulfillment | ⏳ | |
| Chores | Definition & execution | 🚧 | collections & endpoints added; store scaffold; tests pending |
| Batteries | Definition & charge cycles | 🚧 | scaffold this sprint |
| Equipment | Asset registry | 🚧 | scaffold this sprint |
| Tasks | Tasks & categories | ⏳ | |
| Calendar | iCal feed | ⏳ | |
| Files | Upload & thumbs | ⏳ | |
| Print | Labels & lists | ⏳ | |

### Next Sprint – Planned Work
1. **Core → User settings**  
   • Implement Vue UI for settings modal  
   • Add Pinia store actions + persistence  
   • Write unit tests for happy-path load/save  

2. **Chores**  
   • Finish Pinia store + wire to backend `/chores` endpoints  
   • Simple UI list & execute dialog  
   • Add store tests covering fetch & execute   

3. **Batteries**  
   • Scaffold collections & Go hooks  
   • Implement Pinia store and minimal status page  
   • Add basic unit test for store fetch  

4. **Equipment**  
   • Similar steps as Batteries (store + UI card)  

*All new features require accompanying unit tests; CI must remain green.*

Last updated: 2025-07-13