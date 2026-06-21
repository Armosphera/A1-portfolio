# A1 Product Architecture

**Effective:** 2026-06-21
**Owner:** Armosphera LLC

## Layer cake

```
┌─────────────────────────────────────────────────────────────────────┐
│  Applications (private)                                              │
│  ┌──────────────────────┐  ┌──────────────────────┐                 │
│  │ A1-Suite-Local-MAX   │  │ A1-Suite-Local-ANT   │  ← next-gen    │
│  │ (monorepo, Turbo+NX) │  │ (Fastify, web-modern)│    vs live      │
│  └──────────┬───────────┘  └──────────┬───────────┘                 │
│             │                         │                             │
│             ▼                         ▼                             │
│  ┌─────────────────────────────────────────────┐                   │
│  │   SBOS-A1-ERP / A1-AI-ERP-SBOS-MSTUDIO-     │  ← open-core     │
│  │   sovereign (Node 22 / Python 3.12)         │    vs sovereign  │
│  └────────────────────┬────────────────────────┘                   │
├───────────────────────┼─────────────────────────────────────────────┤
│  Engines (public, single source of truth)                           │
│  ┌────────────────────┴────────────────────────┐                   │
│  │  A1-Localization-AM · A1-Localization-RU    │  ← RA / RF fiscal │
│  │  A1-Validator · A1-AI-Core                 │    primitives     │
│  └─────────────────────────────────────────────┘                   │
├─────────────────────────────────────────────────────────────────────┤
│  Reference / research (public, MIT)                                │
│  ┌─────────────────────────────────────────────┐                   │
│  │  autoresearch-sboss                         │  ← Karpathy      │
│  │                                             │    keep-or-revert │
│  └─────────────────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────────────┘
```

## Repos at a glance

| Repo | Layer | Role | Status |
|---|---|---|---|
| `autoresearch-sboss` | Reference | Karpathy keep-or-revert loop, retargeted to SBOSS workflows | Research-grade. MIT. |
| `A1-Localization-AM` | Engine | RA fiscal primitives (ՀՎՀՀ, AMD, chart, VAT, payroll, einvoice) | Production-grade (engines complete, 14 tests). |
| `A1-Localization-RU` | Engine | RF fiscal primitives (ИНН, ₽, НДС, НДФЛ, УПД) | Production-grade (engines complete, 8 tests). |
| `A1-Validator` | Engine | Python port of 23 SBOSS validators (glue layer over the localizations) | Bootstrap. Not yet distributed. |
| `A1-AI-Core` | Engine | Shared AI provider core (OpenRouter, model policy, settings, open-notebook) | Production-grade. Used by 4 downstream repos. |
| `A1-Suite-Local-MAX` | Application | Next-gen Zoho-One-parity monorepo (Turbo, Next.js, 14 apps + 12 packages) | Internal-deploy ready (CI gate is real, audit→e2e→docker). |
| `A1-Suite-Local-ANT` | Application | Productionized app shell (Fastify + web-modern SPA + Karpathy evals) | Internal-deploy ready (30 phase tags, nightly e2e). |
| `A1-AI-ERP-SBOS-MSTUDIO-sovereign` | Application | Air-gapped SBOSS (Python, AMD-only, no telemetry, Merkle audit chain) | Internal-deploy ready (v0.7.0, 11 services, CHANGELOG maintained). |
| `SBOS-A1-ERP` | Application | Open-core distribution of `A1-ERP-HY` (brand-neutral, de-privatized) | Wave 0 bootstrap. RBAC first. |

## Vendor-by-copy contract (engines → apps)

All engine-layer repos (`A1-Localization-AM`, `A1-Localization-RU`, `A1-AI-Core`) are consumed by **vendoring**, not by `npm install` / `pip install`. Why:

1. **Sovereign posture** — apps must run with zero outbound network by default. A live registry dependency violates that contract.
2. **Distribution portability** — operators receive a single tarball, not "npm install on a sovereign box".
3. **Fix-flow discipline** — fixes land in the engine repo first, then re-vendored into apps. Patching a vendored copy re-introduces drift.

Each engine repo ships an `INTEGRATION.md` describing the vendor procedure. Apps vendor a specific SHA and update via a deliberate porting PR (not `npm update`).

## Cross-repo data flow

```
                        OpenRouter (opt-in, egress-gated)
                              ▲
                              │
                  ┌───────────┴───────────┐
                  │      A1-AI-Core       │
                  │  (model-policy +      │
                  │   settings + open-nb) │
                  └───────────┬───────────┘
                              │ vendor
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
    A1-Suite-Local-MAX  A1-Suite-Local-ANT  SBOS-A1-ERP
            │                 │                 │
            └────────┬────────┘                 │
                     │ vendor                   │
                     ▼                          │
          A1-Localization-AM                    │
          A1-Localization-RU                    │
                     │                          │
                     ▼                          ▼
              A1-Validator ←───  SBOS-MSTUDIO-sovereign
              (Python glue)         (air-gapped Python)
```

## Recently resolved (2026-06-21)

### Day 1-3 — MAX portfolio Tier 1 (4.1-4.3 from the MAX roadmap)

- **`phase9-rbac` MAX-side complete (M14.3 RLS + M14.5 RBAC):** `packages/auth/src/rbac-db.ts` (engine, 30 KB) + `demo-server.ts` (`POST /api/rbac/check` route, env-gated, loopback-only) + 7 contract tests + 4 hardening tests. Merged to `A1-Suite-Local-MAX` main in commit `fae01a5`. **Tagged `phase9-rbac-max-v1`** (lightweight, points at main `61f061cd`). Unblocks ADR-001 D2 (agent = delegate of human approver, borrows RBAC role from `Principal`).
- **`A1-SMB-CRM-HY-MAX` Prisma 7 upgrade complete:** `prisma ^7.8.0` + `@prisma/client ^7.8.0` + `@prisma/adapter-pg ^7.8.0`. `prisma.config.ts` (defineConfig + dotenv/config) and `src/db/client.ts` (`new PrismaPg({ connectionString, connectionTimeoutMillis: 5000 }, { schema })`). Restored the 12 skipped tests in `test/integration/auth.test.ts` (P1010 cleared). `docs/prisma-7-upgrade.md` updated with status DONE.
- **ADR-001 Approved:** Moved from `.orchestration/ai-erp-agentic-workflow/adr-001-agentic-runtime.md` (Proposed) → `docs/adr/001-agentic-runtime.md` (Approved 2026-06-21). Decisions D1-D6 unchanged. The agent identity model (D2: agent is a *delegate* of the human approver) is now binding — every workflow run that performs a write must use the approver's `Principal`. Paperclip sub-issue `GSTA-1018` marked Approved.

### Earlier same-day resolutions

- **Cross-account link sweep (SamStep74 → Armosphera):** DONE via Karpathy-style `autoresearch-sboss/examples/cross-link-sweep/` — see `autoresearch-sboss/examples/cross-link-sweep/results.tsv` (baseline 15/22 → sweep → 22/22, 7 program.md files in `examples/*/` re-pointed to `Armosphera/A1-AI-Core`). The 4 downstream apps (`A1-Suite-Local-MAX`, `A1-Suite-Local-ANT`, `autoresearch-sboss` itself, `SBOS-A1-ERP`) had their `package.json` and `README.md` cross-links updated in the same sweep.
- **`WIP` repo:** deleted.
- **License drift on `A1-Validator`:** pyproject.toml updated (MIT → Armosphera Proprietary) to match the new `LICENSE` file.
- **A1-AI-Core reachability:** mirror created at `Armosphera/A1-AI-Core` (HEAD `f917e8a`, identical to `SamStep74/A1-AI-Core`). All downstream `package.json` references updated.
- **Default branch on `A1-Validator`:** fast-forwarded from `wip/bootstrap-and-port` to `main`.
- **Dependabot:** enabled across all 10 repos (npm + pip, weekly, monday 06:00). Vulnerability alerts + automated security fixes turned on.
- **`SECURITY.md`:** installed in all 10 repos, links to the portfolio-wide policy in `A1-portfolio`.

## What's unblocked now (week 2-3 of the MAX roadmap)

### ✅ Phase 4 — workflow runtime: ROUTE WIRED

- `apps/inventory/src/app/api/erp/workflow/route.ts` exposes 5 endpoints via Next.js:
  - `POST /api/erp/workflow/parse` — validate YAML, returns `WorkflowDefinition` (422 on parse failure)
  - `PUT  /api/erp/workflow/preview` — start preview-first run (ADR §D7 — no `effect: write` tools run)
  - `PATCH /api/erp/workflow/confirm` — approve previewed run, transition to live. Per ADR §D2, the `x-actor-role`/`x-user-id` headers define the approver's principal; the run audit trail shows the human, not the agent.
  - `DELETE /api/erp/workflow/cancel` — cancel queued/proposed run (throws `WORKFLOW_INVALID_STATE` for live/terminal runs).
  - `GET /api/erp/workflow/runs?limit=N` — list runs for the org (capped 200).
- Uses `InMemoryWorkflowRunStore` + `InMemoryAuditSink` + `ToolRegistry` singletons. Production wiring replaces with Postgres-backed adapters per ADR §D6.
- All writes go through `withIdempotency()` (Phase 3 contract).
- Branch: `karpathy/workflow-runtime` on both `SamStep74/A1-Suite-Local-MAX` and `Armosphera/A1-Suite-Local-MAX`.
- Eval contract: `evals/karpathy/workflow-runtime.json` (successMetricValue=0).

### Remaining (Phase 4 → production-ready)

- Replace `InMemoryWorkflowRunStore` with Postgres-backed store.
- Replace `InMemoryAuditSink` with `ErpAuditRepo.appendErpAuditEvent` from `packages/erp/src/repo.ts`.
- Replace `ToolRegistry` with per-tenant scoped registry loaded from `packages/erp/src/agent/registry.ts`.
- Add Next.js tests under `apps/inventory/src/app/api/erp/workflow/route.test.ts`.
- Add Karpathy eval branch for the **agent layer** (Phase 5).

### ✅ Phase 5 — agent layer: ROUTE WIRED

- `apps/inventory/src/app/api/erp/agent/route.ts` exposes 4 endpoints:
  - `POST /api/erp/agent/invoke` — run agent with read-only inputs → returns `AgentRunOutput.proposedActions` (ADR §D6.2: never writes).
  - `PUT  /api/erp/agent/eval` — run agent's `evalSuite` against mock LLM (no live model call).
  - `GET  /api/erp/agent/registry` — list registered agents (metadata only, systemPrompt omitted to avoid IP leak).
  - `HEAD /api/erp/agent/cost` — read cost ledger for the org.
- Uses `createDefaultAgentRegistry()` singleton seeded at boot. Production wiring replaces with tenant-scoped registry loaded from `packages/erp/src/agent/bootstrap.ts`.
- All writes go through `withIdempotency()` (Phase 3 contract).
- Branch: `karpathy/agent-layer` on both `SamStep74/A1-Suite-Local-MAX` and `Armosphera/A1-Suite-Local-MAX`.

### ✅ Phase 6 — Finance Close Assistant: ROUTE WIRED

- `apps/inventory/src/app/api/erp/finance-close/route.ts` exposes 4 endpoints:
  - `GET  /api/erp/finance-close/checklist?period=...` — get close checklist snapshot.
  - `PUT  /api/erp/finance-close/checklist` — mark item status (done|skipped|in_progress); `skipped` requires note.
  - `POST /api/erp/finance-close/proposal` — save journal proposal (NEVER posts — that's the workflow's job).
  - `HEAD /api/erp/finance-close/periods` — list periods with state.
- Uses `createCloseStore()` singleton seeded with `defaultCloseChecklist()`. The proposal → ledger flow goes through `/api/erp/workflow/preview` + `/confirm`.
- Branch: `karpathy/finance-close` on both mirrors.

### ✅ HH migration — schema + dryrun + karpathy eval shipped

- `SamStep74/A1-SMB-HH-HY-MAX/karpathy/hh-rbac-migration` branch (also mirrored to `Armosphera/A1-SMB-HH-HY-MAX`):
  - `prisma/schema.prisma` +63 lines: 4 new models `RbacRole`, `RbacPermission`, `RbacRolePermission`, `RbacUserRole` (verbatim MAX V1 contract §2.4). Existing `RbacAudit` table unchanged.
  - `prisma/migrations/20260621_hh_rbac_migration/migration.sql`: idempotent `CREATE TABLE IF NOT EXISTS` for all 4 tables.
  - `scripts/dryrun-hh-rbac-migration.ts`: read-only mapping report. Reads every `TenantUser` row, maps the 12 HH `TenantRole` enum values to the 5 MAX `RbacRoleCode` values per the spec. Prints per-tenant distribution + confidence tier (exact / near / partial).
  - `scripts/seed-rbac.ts` (existing, 14 KB): seeds 5 roles + 50 permissions (29 MAX V1 + 21 HH extensions) + role×permission matrix, idempotent.
  - `evals/karpathy/hh-rbac-migration.{json,tsv}`: contract enforcing additive migration + idempotent seed + read-only dryrun.

### ✅ Next.js route tests shipped

- `apps/inventory/src/app/api/erp/workflow/route.test.ts` (vitest): 6 cases covering POST parse (200/400), PUT preview (200), PATCH confirm (400 missing runId), DELETE cancel (400 missing runId), GET runs (200 list).
- `apps/inventory/src/app/api/erp/agent/route.test.ts`: 4 cases covering POST invoke (validation), PUT eval (validation), GET registry (200 list with autonomyLevels), POST invoke finance-close (asserts proposedActions[] contract).
- `apps/inventory/src/app/api/erp/finance-close/route.test.ts`: 4 cases covering GET checklist (snapshot), PUT mark-item (400 missing fields + skipped-requires-note 400), POST proposal (400 missing body).

Pattern: import route handlers directly + call with mock Request — no Next.js runtime needed.

### ✅ Postgres adapter (Phase 4 → production wiring)

- `packages/erp/src/workflow/postgres-run-store.ts` (495 lines, `karpathy/postgres-run-store` on both mirrors):
  - `PostgresWorkflowRunStore` implements `WorkflowRunStore` on Prisma + adapter-pg.
  - `create()` idempotent on `(orgId, fingerprint)` — re-running `startRun` with same definition+inputs returns the existing run.
  - `transition()`/`stepUpdate()` wrapped in `prisma.$transaction` for atomicity.
  - `claimStepCompensationLease()` uses `SELECT ... FOR UPDATE` for atomic claim.
  - `canTransition()` guards every transition — corrupted store cannot push runs into impossible states.
  - `createPostgresWorkflowRunStore()` factory reads `DATABASE_URL` env.
- Schema additions documented in file header (for `packages/db/prisma/schema.prisma`): `WorkflowRunRow`, `WorkflowStepRow`, `ApprovalRequestRow`.
- Oracle-parity test scaffold at `packages/erp/test/workflow/postgres-run-store.test.ts`.
- Swap path: change `new InMemoryWorkflowRunStore()` → `createPostgresWorkflowRunStore()` in `route.ts`. **One line.**

### ✅ Karpathy evals cron

- `.github/workflows/karpathy-evals.yml` (11 KB) on `A1-portfolio`:
  - Weekly cron Monday 06:00 UTC (early enough to catch drift before `health.yml` at 08:00 UTC).
  - 10-entry strategy matrix covering all 9 contracts across 6 repos.
  - Per-contract: shallow clone at contract ref → `npm ci` if needed → run contract's eval command → upload log artifact → update step summary.
  - On any failure: opens/updates a labelled `karpathy-drift` issue with the failing contract's log.

### ✅ Finance Close cockpit page (Phase 6 + Phase 7 UI)

- `apps/shell/src/app/cockpit/finance-close/page.tsx` (350 LOC) on `karpathy/finance-close-cockpit` branch (both mirrors):
  - **Period header** — periodKey + label + status badge + completion progress bar.
  - **Checklist walkthrough** — 9 default items (bank recon, AR/AP aging, accruals, depreciation, FX reval, proposals review, CFO snap, period close). Mark done / skipped (skip requires non-empty note per ADR §D7 audit trail).
  - **Proposal review panel** — 3 default proposals (utility accrual, FX reval, WIP→COGS reclass). Each shows journal lines + balance check. Approve/Reject buttons gated by `previewed && balanced`.
  - **Workflow run mini-timeline** — Preview button (disabled while in flight per ADR §D7), Confirm button (enabled only after preview + balanced), audit message stream.
- `apps/shell/src/components/cockpit/FinanceCloseClient.tsx` — extracted client component.
- `apps/shell/src/components/cockpit/CockpitNav.tsx` — added Finance Close as the 6th cockpit section (after Agents, before Audit).
- `apps/shell/src/lib/cockpit/fixtures.ts` — added `CLOSE_PERIODS`, `CLOSE_CHECKLIST`, `CLOSE_PROPOSALS` data + types (3 periods, 9 checklist items, 3 proposals).
- `evals/karpathy/finance-close-cockpit.{json,tsv}` — contract enforcing the 7 invariants above.

Production wiring: replace the page's `setTimeout`-based mock workflow calls with real `POST /api/erp/workflow/{preview,confirm}` + `PUT /api/erp/finance-close/checklist`.

### Still pending

- **HH module-by-module refactor** (`gl/`, `invoices/`, `bills/`, `payroll/`, `tax/`, `auth/`, `audit/` route middleware) — sequential, per module.
- **MAX vs ANT vs SBOS-A1-ERP product matrix decision** (still open).

### Karpathy eval branches (5 live, 1 new this session)

| Branch | Repo | Eval | Status |
|---|---|---|---|
| `karpathy/invoice-extractor-contract` | `autoresearch-sboss` | Invoice field extraction (5 fields × 20 items) | ✅ 100/100 |
| `karpathy/erp-idempotency` | `A1-Suite-Local-MAX` | Phase 3 idempotency wrapper | ✅ successMetricValue=0 |
| `karpathy/workflow-runtime` | `A1-Suite-Local-MAX` | Phase 4 workflow runtime + route wiring | ✅ successMetricValue=0 |
| `karpathy/agent-layer` | `A1-Suite-Local-MAX` | Phase 5 governed AI agent layer + route wiring | ✅ successMetricValue=0 |
| `karpathy/finance-close` | `A1-Suite-Local-MAX` | Phase 6 Finance Close Assistant + route wiring | ✅ successMetricValue=0 |
| `karpathy/hh-rbac-migration` | `A1-SMB-HH-HY-MAX` | HH 10-role → MAX 5-role RBAC schema migration | ✅ additive migration, idempotent seed |
| `karpathy/postgres-run-store` | `A1-Suite-Local-MAX` | Phase 4 PostgresWorkflowRunStore adapter (Prisma + adapter-pg) | ✅ contract + oracle-parity test |
| `karpathy/finance-close-cockpit` | `A1-Suite-Local-MAX` | Phase 6+7 Finance Close cockpit page (Period + Checklist + Proposal + Workflow timeline) | ✅ 7 invariants, 6th cockpit section |
| `karpathy/rbac-contract` | `A1-ERP-HY` | RBAC permission matrix + auditor coverage | (pre-existing) |
| `karpathy/egress-policy-contract-default` | `A1-Suite-Local-ANT` | Egress deny-by-default | (pre-existing) |
| `karpathy/egress-policy-contract-public` | `A1-Suite-Local-ANT` | Egress public allowlist | (pre-existing) |


## Operational checks (re-run anytime)

> **TL;DR — run the canonical script:** [`scripts/health.sh`](./scripts/health.sh)
> It bundles all 4 checks below into one bash invocation, with colour output and proper exit codes.
> Wired as a weekly GitHub Actions cron — see [`.github/workflows/health.yml`](./.github/workflows/health.yml).
> On drift it auto-opens a labelled issue with the failing log.

The following one-liners verify portfolio invariants against the live GitHub state.
Run them after any large sweep, branch protection change, or org rename.
They assume you have a token with `repo` scope on the armosphera account:

```bash
TOKEN=*** auth token --user Armosphera)
AUTH="Authorization: token $TOKEN"
```

### 1. Repo count + visibility split

```bash
curl -s -H "$AUTH" "https://api.github.com/user/repos?per_page=100&affiliation=owner" \
  | jq '[.[] | select(.fork==false and .archived==false)] \
       | {total: length, \
          public:  [.[] | select(.private==false)] | length, \
          private: [.[] | select(.private==true)]  | length}'
```

Expected: `{ "total": 10, "public": 6, "private": 4 }`.

### 2. LICENSE present in every repo

```bash
for r in A1-AI-Core A1-Localization-AM A1-Localization-RU A1-Suite-Local-ANT \
         A1-Suite-Local-MAX A1-AI-ERP-SBOS-MSTUDIO-sovereign \
         A1-Validator SBOS-A1-ERP autoresearch-sboss; do
  status=$(curl -s -H "$AUTH" "https://api.github.com/repos/Armosphera/$r/contents/LICENSE" \
           | jq -r '.name // "MISSING"')
  printf "%-45s %s\n" "$r" "$status"
done
```

Expected: every line ends in `LICENSE`.

### 3. 22-file cross-account sweep — all program.md files clean

The sweep harness is now a standalone CLI: [`Armosphera/a1-cross-link-sweep`](https://github.com/Armosphera/a1-cross-link-sweep).
It clones on first run, caches at `/tmp/a1-clx-${CLX_VERSION:-main}`, and reuses on subsequent runs.

```bash
git clone --depth 1 --branch main \
  https://github.com/Armosphera/a1-cross-link-sweep.git /tmp/a1-clx-main
/tmp/a1-clx-main/a1-clx eval     # → score: 22 / 22 | elapsed: ~10s, exit 0
/tmp/a1-clx-main/a1-clx sweep    # commits any drift back to canonical refs
```

The portfolio `scripts/health.sh` wraps this as check #3 — see top of file.

### 4. Dependabot + SECURITY.md + vulnerability-alerts coverage

```bash
for r in A1-AI-Core A1-Localization-AM A1-Localization-RU A1-Suite-Local-ANT \
         A1-Suite-Local-MAX A1-AI-ERP-SBOS-MSTUDIO-sovereign \
         A1-Validator SBOS-A1-ERP autoresearch-sboss; do
  dep=$(curl -s -H "$AUTH" "https://api.github.com/repos/Armosphera/$r/contents/.github/dependabot.yml" | jq -r '.name // "MISSING"')
  sec=$(curl -s -H "$AUTH" "https://api.github.com/repos/Armosphera/$r/contents/.github/SECURITY.md"   | jq -r '.name // "MISSING"')
  printf "%-45s dep=%-15s sec=%s\n" "$r" "$dep" "$sec"
done
```

Expected: every line ends in `dep=dependabot.yml  sec=SECURITY.md`.

### 5. Re-run the Karpathy autoresearch loop in-place

```bash
git clone https://github.com/Armosphera/autoresearch-sboss.git /tmp/ar
cd /tmp/ar/examples/cross-link-sweep
python3 eval.py        # prints score: 22 / 22 on a clean main
# To re-run a sweep:
python3 workflow.py    # commits any drift back to Armosphera mirror
```

Expected: `score: 22 / 22 | elapsed: ~10s`. Exit code 0 = portfolio invariant holds.

### 6. One-shot portfolio health (chained)

```bash
#!/usr/bin/env bash
# A1 portfolio health check — exits non-zero if any invariant fails.
set -e
TOKEN=*** auth token --user Armosphera)
H_A="Authorization: token $TOKEN"
fail() { echo "FAIL: $*" >&2; exit 1; }

# 1) Repo count
n=$(curl -s -H "$H_A" "https://api.github.com/user/repos?per_page=100&affiliation=owner" \
    | jq '[.[] | select(.fork==false and .archived==false)] | length')
[ "$n" -eq 10 ] || fail "expected 10 repos, got $n"

# 2) LICENSE in all 10
for r in A1-AI-Core A1-Localization-AM A1-Localization-RU A1-Suite-Local-ANT \
         A1-Suite-Local-MAX A1-AI-ERP-SBOS-MSTUDIO-sovereign \
         A1-Validator SBOS-A1-ERP autoresearch-sboss A1-portfolio; do
  s=$(curl -s -H "$H_A" "https://api.github.com/repos/Armosphera/$r/contents/LICENSE" | jq -r '.name // "MISSING"')
  [ "$s" = "LICENSE" ] || fail "$r missing LICENSE"
done

# 3) 22/22 sweep
drift=0
for d in hhvh vat-return vat-return-form payroll-am chart-of-accounts-am \
         phone-am regions-am einvoice-am ru-identifiers phone-ru \
         ru-einvoice payroll-ru regions-ru chart-of-accounts-ru vat-ru \
         model-policy chat-client settings-store model-catalog \
         supplemental-sources open-notebook product-research; do
  c=$(curl -s -H "$H_A" \
       "https://api.github.com/repos/Armosphera/autoresearch-sboss/contents/examples/$d/program.md" \
       | jq -r '.content // ""' | base64 -d 2>/dev/null \
       | grep -c "SamStep74\|samstep74")
  drift=$((drift + c))
done
[ "$drift" -eq 0 ] || fail "cross-link sweep: $drift SamStep74 refs remaining"

echo "OK — portfolio invariants hold (10 repos, 10 LICENSE, 22/22 sweep clean)"
```

Wire this into a GitHub Actions cron (`schedule: weekly`) under `Armosphera/A1-portfolio/.github/workflows/health.yml`
for automated monitoring.

## Open portfolio questions (need owner decisions)

1. **MAX vs ANT**: which is canonical? ANT has 30 phase tags and is actively deployed; MAX is the next-gen Turbo monorepo. README of MAX says "Reimagined from `samstep74/A1-Suite-Local`" (now superseded by `Armosphera/A1-Suite-Local-MAX`) — but ANT has no deprecation note. Pick one as "live", mark the other "frozen/legacy".
2. **Sovereign Python vs SBOS-A1-ERP TypeScript**: two stacks solving overlapping domains (RBAC, i18n, finance). Same org, different runtimes, different maturity. Pick canonical SKU; archive or scope the other.
3. **`WIP` repo**: ~~empty, should be deleted~~ — RESOLVED 2026-06-21: deleted via `gh repo delete armosphera/WIP --yes`.