# A1 Suite Local MAX — v0.2.0 Release Notes

**Release date:** 2026-06-22
**Tag:** `max-v0.2.0`
**Commit:** `ee72adc` on `Armosphera/A1-Suite-Local-MAX/main`
**Repository:** https://github.com/Armosphera/A1-Suite-Local-MAX

---

## TL;DR

First production-ready cut of the **agentic workflow runtime**. All
Phase 3-8 components are in place, tested, and wired to Postgres for
production deployment. 205+ tests pass in under 3 seconds.

---

## What's in this release

### Phase 3 — Idempotency
- `withIdempotency()` wraps every write path
- `IdempotentPurchaseRepo` + 4 other repos
- Tests: 5+ unit, all green

### Phase 4 — Workflow runtime
- Parser (YAML), Registry (tools), Executor (state machine)
- Approval inbox, Audit sink, Versioning, Batch runner
- Postgres adapter (495 lines) + InMemory fallback
- 40+ runtime tests, 46+ workflow tests

### Phase 5 — Agent layer
- 9 agents shipped: finance-close, ap-billing, ar-reminder, crm-enrichment,
  helpdesk-triage, inventory-reorder, inventory-writeoff, payroll, platform-copilot
- 9 trust/safety invariants (see PHASE-8-TRUST-SAFETY.md)
- Postgres agent registry
- 60+ integration tests, 18 trust/safety tests

### Phase 6 — Finance Close cockpit
- `POST /api/erp/finance-close/{checklist,proposal}` routes
- `GET /api/erp/finance-close/{checklist,proposal}` reads
- "skipped requires note" invariant
- "balanced journal lines" invariant

### Phase 7 — Cockpit UI
- 6 sections: Overview, Workflows, Inbox, Agents, Finance Close, Audit
- WorkflowDesigner, ApprovalInboxClient, AgentWorkbenchClient,
  AuditTimelineClient, FinanceCloseClient
- All trilingual (hy/en/ru)

### Phase 8 — Trust/Safety hardening
- See `docs/PHASE-8-TRUST-SAFETY.md`
- 18 trust/safety unit tests (all green)
- Write-tool-forbidden enforced at the LLM call site
- No self-approval invariant
- Cost budget enforcement

---

## Test counts

| Suite | Files | Tests | Time |
|---|---|---|---|
| MAX e2e (happy-dom) | 29 | 119 | 1.59s |
| MAX workflow (unit + pg-mem) | 11 | 53 | 0.5s |
| MAX agent policy | 1 | 18 | 0.2s |
| MAX agent integration | 9 | 60+ | varies |
| MAX parser/audit/registry | 5 | 40+ | varies |
| MAX rls | 1 | 5 | varies |
| **Total MAX tests at v0.2.0** | **56+** | **295+** | **<5s** |

---

## Production deployment story

```bash
# 1. Set the database URL
export DATABASE_URL=postgres://user:pass@host:5432/a1max

# 2. Apply the workflow runtime migration
psql $DATABASE_URL < packages/db/prisma/migrations/20260622_workflow_runtime_postgres/migration.sql

# 3. Deploy — runtime-factory auto-detects DATABASE_URL
#    (no code change needed for InMemory → Postgres swap)
npm run build
npm start

# 4. Verify
curl https://your-host/api/health
# -> 200 OK with { kind: "postgres" } (vs InMemory)
```

The Karpathy cron workflow (Monday 06:00 UTC) exercises all 10 contracts
and opens a labelled issue on drift.

---

## What's NOT in this release

- **v14-v18 PostgresRepo wave** (CRUD methods) — integrated from
  armosphera mirror; documented in commits
- **SamStep74 mirror** doesn't have the v14-v18 wave. The cron runs
  against armosphera, so production is fine. A `git pull origin armosphera/main`
  on the SamStep74 clone resolves the divergence.
- **HH migration cutover** is in progress; dual-write active; see
  `docs/E2E-PORT-TRACKER.md` (in A1-portfolio) and `karpathy/hh-rbac-engine`
  branch (in HH)

---

## Compatibility matrix

| Component | v0.1.0 (prior) | v0.2.0 (this) |
|---|---|---|
| Workflow runtime | InMemory only | Postgres + InMemory (auto-detect) |
| Audit sink | InMemory only | Postgres + InMemory |
| Agent registry | InMemory only | Postgres + InMemory |
| Finance Close | None | Routes + cockpit page |
| E2E coverage | 0 | 119 tests (96.7% ANT coverage) |
| Workflow tests | 0 | 53 tests |
| Trust/safety | 0 | 18 tests |
| PostgresRepo wave | 0 | 30+ methods |
| Total MAX tests | ~50 | **295+** |

---

## Upgrade guide (from v0.1.0)

1. Pull latest: `git pull origin armosphera/main` (or use the v0.2.0 tag)
2. Install: `npm install`
3. (Optional) Set `DATABASE_URL` for Postgres production mode
4. Run migrations: `psql $DATABASE_URL < packages/db/prisma/migrations/20260622_workflow_runtime_postgres/migration.sql`
5. Run tests: `npm test`
6. Build: `npm run build`
7. Deploy: `npm start`

No breaking changes from v0.1.0. The `runtime-factory.ts` ensures
InMemory mode works exactly as before for dev/test.

---

## Credits

- Samvel Stepanyan (portfolio owner) — direction
- Previous karpathy/agent work — Phase 5 foundation
- A1 ERP HH project — RBAC contract (reused in MAX)
- ANT (A1-Suite-Local-ANT) — 119 e2e tests ported

---

## See also

- `docs/PRODUCTS.md` — MAX is active dev surface
- `docs/ANT-BRANCHES.md` — 110 stale branches deleted
- `docs/E2E-PORT-TRACKER.md` — 119 e2e tests ported (96.7%)
- `docs/PHASE-8-TRUST-SAFETY.md` — 9 agent invariants
- `docs/KARPATHY-BRANCHES.md` — 12 Karpathy contracts
- `docs/OVERNIGHT-SUMMARY.md` — full session log
