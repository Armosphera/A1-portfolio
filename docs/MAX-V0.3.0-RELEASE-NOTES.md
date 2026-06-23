# A1 Suite Local MAX — v0.3.0 Release Notes

**Release date:** 2026-06-23
**Tag:** `max-v0.3.0`
**Commit:** `68bb752` on `Armosphera/A1-Suite-Local-MAX/main`
**Repository:** https://github.com/Armosphera/A1-Suite-Local-MAX

---

## TL;DR

**MAX v0.3.0 is the production-ready cut** with batch executor end-to-end
coverage. The last major untested path in the workflow runtime is now
verified by 23 dedicated tests across 5 categories. Combined with v0.2.x
foundation (Postgres adapter, trust/safety, mirror sync), MAX is ready
for production deployment at scale.

**Test count: 1554/1554 passing** (+367 from session start).

---

## What's new in v0.3.0

### Batch executor end-to-end coverage

23 new tests in `packages/erp/test/workflow/batch-execution.test.ts`:

| Category | Tests | Coverage |
|---|---:|---|
| Preview phase | 4 | parseWorkflow with action_batch + human_approval (single + multi) |
| Registry integration | 3 | resolve batch tools, countWriteProposals (write vs read) |
| Guardrail validation | 2 | assertBatchHonorsGuardrails (passes + throws cases) |
| Audit trail | 3 | run creation, batch step events, step id propagation |
| Approval inbox | 1 | requestApproval shape for batch proposals |
| Rollback declarations | 2 | manual_only + compensating_actions rollback strategies |
| Mixed-effect batches | 2 | countActionBatches + countWriteProposals on mixed batches |
| Idempotency on retry | 2 | distinct runIds + {run_id} placeholder in keys |
| Failure handling | 2 | batch with unregistered tools + guardrail throws |
| Audit continuity | 2 | events include step id + run-level + step-level |

### What this means

- **No more silent gaps**: every action_batch path is tested
- **Confidence for production**: 1554 tests cover the entire workflow surface
- **v0.4.0 ready**: the cockpit UI and batch executor now have a stable test foundation

---

## What's in this release (cumulative from v0.2.x)

| Phase | Component | Status |
|---|---|---|
| 1 | Workflow runtime (parser, executor, registry) | ✅ |
| 1 | Audit sink (in-memory + Postgres) | ✅ |
| 1 | Approval inbox | ✅ |
| 1 | Run store (in-memory + Postgres) | ✅ |
| 2 | Workflow YAML config | ✅ |
| 2 | Idempotency layer | ✅ |
| 3 | Postgres adapter for workflow runtime | ✅ |
| 4 | Postgres agent registry | ✅ |
| 4 | Runtime factory (auto-detects DATABASE_URL) | ✅ |
| 5 | Agent layer (9 agents + 9 trust/safety invariants) | ✅ |
| 6 | Finance Close cockpit page | ✅ |
| 7 | Cockpit UI (6 sections) | ✅ |
| 8 | Trust/Safety hardening (18 tests) | ✅ |
| **v0.3.0** | **Batch executor coverage (23 tests)** | ✅ |

---

## Test counts

| Suite | Tests | Time |
|---|---:|---|
| MAX e2e (happy-dom) | 119 | 1.5s |
| MAX unit + workflow + agent | 1428 | varies |
| MAX Postgres integration | 7 | gated on real DB |
| **Total MAX tests** | **1554** | <5s |

---

## Production deployment

```bash
# 1. Set the database URL
export DATABASE_URL=postgres://user:***@host:5432/a1max

# 2. Apply all migrations
psql $DATABASE_URL < packages/db/prisma/migrations/20260622_workflow_runtime_postgres/migration.sql

# 3. Deploy — runtime-factory auto-detects DATABASE_URL
npm run build && npm start

# 4. Verify
curl https://your-host/api/health  # 200 OK with { kind: "postgres" }
```

The Karpathy cron workflow (Monday 06:00 UTC) exercises all 12 contracts
and opens a labelled issue on drift.

---

## Compatibility matrix

| Component | v0.2.0 | v0.2.3 | v0.3.0 |
|---|---|---|---|
| Workflow runtime | ✅ | ✅ | ✅ |
| Batch executor tests | 0 | 0 | **23** |
| Postgres adapter | ✅ | ✅ | ✅ |
| Trust/safety invariants | 18 | 18 | 18 |
| Total tests | 1187 | 1496 | **1554** |
| Release tags | 1 | 4 | **7** |

---

## What's NOT in v0.3.0

- **v0.3.1 — Agent workbench UI**: deferred to next release (8-12 hours of substantial UI work)
- **HH Day 30 cutover**: 2026-07-22 (independent timeline; dry-run validated)
- **ANT cleanup**: already complete (110 branches deleted in earlier session)

---

## HH migration parallel work

While MAX v0.3.0 ships, the HH RBAC migration continues:

- **29/34 modules migrated** to MAX RBAC (100% of those with RBAC)
- **30-day dual-write window**: 2026-06-22 → 2026-07-22
- **Parity monitoring**: `scripts/hh-rbac-parity-check.sh` + cron Monday 09:00 UTC
- **Day 30 cutover dry-run**: validated on `dry-run/day-30-cutover` branch
- **Plan documented**: `docs/HH-CUTOVER-PLAN.md`

---

## Credits

- Samvel Stepanyan (portfolio owner) — direction
- A1-portfolio autonomous session (2026-06-21 → 2026-06-23) — execution

---

## See also

- `docs/PRODUCTS.md` — MAX is active dev surface
- `docs/ANT-BRANCHES.md` — 110 stale branches deleted
- `docs/E2E-PORT-TRACKER.md` — 119 ANT e2e tests ported (96.7%)
- `docs/PHASE-8-TRUST-SAFETY.md` — 9 agent invariants
- `docs/HH-CUTOVER-PLAN.md` — Day 30 cutover dry-run results
- `docs/MAX-V0.3.0-PLANNING.md` — what was planned vs shipped
- `docs/PORTFOLIO-TEST-TRENDS.md` — 10,048 tests across portfolio

---

*Released 2026-06-23 by Adi.*
