## Language Evaluation – Re-implementing Grocy

### 1. Evaluation Criteria
1. **Runtime Footprint / Performance** – ability to serve API + background jobs on low-end hardware.  
2. **Deployment Simplicity** – ease of distributing updates to end-users (many are non-technical).  
3. **Database Ecosystem** – mature, SQLite-friendly ORMs/migration tooling.  
4. **Web / API Frameworks** – production-grade routing, middleware, auth, OpenAPI generation.  
5. **Static Type Safety & Maintainability**.  
6. **Learning Curve & Community Size** – impact on contributor base.  
7. **Binary Size & Cross-Compilation** – Docker & desktop wrapper friendliness.  
8. **Extensibility / Plugin Story** – ability to replicate Grocy’s current plugin hooks and user-scripting.

### 2. Candidate Summary
| Criterion | **Go** | **Rust** | **Python** |
|-----------|--------|----------|------------|
| Runtime / Memory | Low; GC tuned for servers | Lowest; zero-cost abstractions | Higher; interpreter + GIL |
| Deployment | Single static binary; tiny containers | Static binary but larger toolchain | Requires virtualenv or embed CPython |
| SQLite ORM | GORM, sqlc, ent, upper.io | Diesel (good but compile heavy) | SQLAlchemy, peewee |
| Web Framework | gin, echo, fiber (mature) | actix-web, axum (fast but still evolving) | Django/Flask/FastAPI |
| Type Safety | Static + simple | Strict static + borrow checker | Optional (type hints) |
| Build Time | Fast | Slow (incremental improving) | N/A |
| Contributor Learning | Easy for most | Steep (memory model) | Easiest |
| Binary Size | ~10 MB | 5-15 MB | n/a |
| Plugin Story | Interface-based; loadable Go plugins tricky, but gRPC/HTTP easy | dylib plugins; nightly feature | Dynamic import = trivial |

### 3. Discussion
• **Go** hits a sweet spot between performance and simplicity.  The garbage collector is predictable; cross-compilation is a first-class citizen, perfectly matching Grocy’s "download & unzip" distribution.  The standard library already covers HTTP, template rendering, i18n, embedding static assets (`go:embed`).  Community frameworks (Gin/Fiber) provide OpenAPI generation which can keep the existing contract.  Packaging as a *single binary* avoids PHP + Composer + Node + Yarn runtime requirements.

• **Rust** offers even more raw performance and memory safety; however compile times, higher cognitive load, and a smaller contributor pool make it less attractive for a hobby project that depends on voluntary contributions.  Also, async maturity (Tokio) is still in flux, and Diesel migrations are *good* but ergonomics can be rough.

• **Python** (FastAPI) would minimise rewrite effort thanks to syntactic proximity to PHP and huge library ecosystem.  Yet, dependency and version management (pip/venv) often confuses end-users; the single-file distribution goal is harder (PyInstaller/Zipper produce >50 MB binaries).  CPU-bound operations (unit-conversion loops, report generation) may need optimisation.

### 4. Recommendation
Given Grocy’s target audience (self-hosting enthusiasts, Raspberry Pi users, Docker), Go provides the best balance:
1. Excellent performance on ARM & x86.  
2. Static linked binary ⇒ trivial installation + updates (same UX as current zip release, but without PHP/Apache).
3. Mature web + database tooling.  
4. Simple syntax attracts wider contributor base than Rust.  
5. Built-in concurrency can further improve background jobs (stock analytic caches, barcode lookups).

**Therefore, Go is the recommended language for the rewrite.**

*(End of document)*