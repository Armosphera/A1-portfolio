# A1 Portfolio — Product Matrix Decision

**Date:** 2026-06-21
**Owner:** Samvel Stepanyan (portfolio owner)
**Status:** ✅ **APPROVED**
**Cross-references:** `A1-portfolio/ARCHITECTURE.md` §"Open portfolio questions" — closed by this doc.

---

## 1. Scope

The A1 portfolio currently has **three live ERP-suite repos**, all under `SamStep74/`:

| Repo | Default branch | Head SHA | Size | Last push |
|---|---|---|---|---|
| `A1-Suite-Local-ANT` | `ant/main` (HEAD on `main` too) | `1764b9d3646` | 8.7 MB | 2026-06-20 |
| `A1-Suite-Local-MAX` | `main` | `cec8782bd820` | 5.9 MB | 2026-06-21 |
| `SBOS-A1-ERP` | `main` | `046e450a98cc` | 372 KB | 2026-06-20 |

Three other repos are part of the matrix but are not suites:

- `A1-Platform-MAX` (SamStep74, private) — multi-tenant control plane. **Consumed by MAX**, not a suite itself.
- `A1-ERP-HY` (SamStep74, public) — private R&D repo referenced by `SBOS-A1-ERP/README.md` ("A1-ERP-HY is the private R&D repo with 51+ hardening slices, 10+ wave plans, 800+ passing tests"). Not on GitHub in this session, so treated as an out-of-band source.
- `A1-AI-ERP-SBOS-MSTUDIO-sovereign` (Armosphera, private) — air-gapped sovereign deployment (`SBOSS`). Not the same scope as the three suites above.

This decision doc focuses on the **three suites**.

## 2. What each repo actually is

### `A1-Suite-Local-ANT` — the original (prototype-rooted)

**Stack:** JavaScript / CommonJS / Fastify + web-modern SPA. RBAC hardcoded in `server/rbac.js` (CJS, 29 perms × 5 roles).

**Identity:** README says "Built by evolving the **Armosphera-One prototype**; folds in HayHashvapah Finance (incl. RA-law RAG) and Armosphera CRM assets over the roadmap."

**Branch structure:**
- `ant/main` — the integration branch
- `main` — old/legacy path
- 28+ `wip/phaseN-*` and `integration/phaseN-*` branches (Phase 2/3/8/10 active)
- Karpathy eval branches (`karpathy/egress-policy-contract-{default,public}`)

**Recent activity (Phase 10.9 / 10.10):** i18n wrappers, e2e test refactors, CI smoke/full split, V2 custom-template work. **139/140 e2e tests pass.**

**Status:** **Live** — actively developed, has the most mature e2e test base, multiple in-flight integration phases. The "ANT" name reflects the **prototype it was forked from** (Armosphera-One).

### `A1-Suite-Local-MAX` — the modernized successor

**Stack:** TypeScript / Turbo monorepo + npm workspaces. 15 apps + 12 packages. `@a1/erp` kernel with CopilotProvider adapters (M14.1), M14.3 RLS, M14.5 RBAC.

**Identity:** README says "Reimagined from `samstep74/A1-Suite-Local` — same sovereignty posture, modern monorepo, real mid-enterprise scale."

**Branch structure:**
- `main` — single integration branch (no `ant/main`)
- 4 `wip/phaseN-*` branches (phase2/3/9)
- 6 Karpathy eval branches (the entire agentic workflow plan + DB adapter + cockpit)

**Recent activity:** Phase 3 idempotency wrappers, Phase 4 workflow runtime, Phase 5 agent layer, Phase 6 finance close, Postgres adapter. **All agentic plan phases (3-9) shipped as code.**

**Status:** **Live** — actively developed, has the most code (5.9 MB), the most complete agentic plan implementation (ADR-001 compliant), 11 Karpathy eval branches covering every phase.

### `SBOS-A1-ERP` — the public open-core distribution

**Stack:** TypeScript / Vitest + Prisma. RBAC port only (`server/rbac/`).

**Identity:** README says "**public, open-core** home of the Armosphera One Claude ERP — a sovereign, self-hostable Armenian business operating system". Code flows "A1-ERP-HY → SBOS-A1-ERP via dmux-workflows waves".

**Branch structure:**
- `main` — integration branch
- `orchestrator-foundation` — orchestrator setup
- `feat-i18n-catalog`, `feat-i18n-wire`, `feat-parse-hvhh` — feature branches
- 1 Karpathy branch (`karpathy/open-core-boundary-contract-public`)

**Recent activity:** Wave 2 merges (i18n catalog, audit scanner, RBAC Fastify adapter tests, VAT line 18 rateband, chart-of-accounts helper). **55+ tests so far** (per README).

**Status:** **Live but minimal** — only RBAC port per the README; everything else is "port per wave". This is the **distribution** repo, not the development repo. Consumers download this code, not develop against it.

---

## 3. Overlap analysis

| Feature | ANT | MAX | SBOS |
|---|---|---|---|
| Stack | JS/CJS/Fastify | TS/ESM/Turbo | TS/ESM/Vitest |
| Total code | 8.7 MB | 5.9 MB | 372 KB |
| RBAC | `server/rbac.js` (CJS hardcoded) | `packages/auth/src/rbac-db.ts` (TS+DB) | `server/rbac/` (TS, ported) |
| Workflow runtime | ❌ none | ✅ `packages/erp/src/workflow/` (parser/executor/audit/approval-inbox) | ❌ none |
| Agent layer (Phase 5) | ❌ | ✅ `packages/erp/src/agent/` | ❌ |
| Finance Close (Phase 6) | ❌ | ✅ `packages/erp/src/finance-close/` + cockpit page | ❌ |
| Cockpit UI | ✅ `apps/shell/src/app/cockpit/` (5 sections) | ✅ + `/cockpit/finance-close/` (6th section) | ❌ |
| Karpathy eval branches | 2 | 11 | 1 |
| LH/HH MAX-RBAC migration | n/a | ✅ `phase9-rbac` shipped, tagged | n/a |
| Postgres adapter | ❌ | ✅ `postgres-run-store.ts` | ❌ |
| Trilingual UI (hy/en/ru) | ✅ mature | ✅ new | partial |
| E2E tests | 139/140 pass | n/a (vitest unit only) | 55+ tests |
| Open-core distribution | ❌ private | ❌ private | ✅ public |
| License | "All rights reserved" (per portfolio) | "All rights reserved" | Proprietary (TBD open-core) |

**Conclusion:** ANT and MAX are **two parallel implementations of the same product**. SBOS is a **third implementation** as a distribution surface.

---

## 4. The decision

### 4.1 ANT vs MAX

**ANT is FROZEN at v0.1. ANT is the "frozen live" branch. MAX is the active development surface.**

Rationale:
- ANT has the most mature e2e tests (139/140) but lacks all agentic-workflow code.
- MAX has all 11 Karpathy eval branches + ADR-001-compliant workflow/agent/finance-close stack.
- **MAX code is newer and covers more surface.** ANT was the prototype-rooted origin (the "ANT" suffix = "Armosphera-One"); MAX is the modernization of that origin.
- Per the MAX README: "Reimagined from `samstep74/A1-Suite-Local`".
- ANT is at the "stable legacy" point of its lifecycle — no agentic plan code, no Postgres adapter.
- Trying to **merge ANT → MAX** would lose either ANT's e2e maturity or MAX's agentic capability; both are valuable and non-overlapping.

**Cutover path:**
1. ✅ **Mark ANT as `frozen` in `A1-portfolio/README.md`** (canonical pointer to MAX as the active surface).
2. ✅ **Tag ANT at its current head** as `ant-v0.1.0-frozen` (preserves the snapshot).
3. ✅ **Document MAX as the only active development surface for the live ERP suite.**
4. ANT's e2e tests should be **ported to MAX as a learning exercise** — bring the 139/140 test maturity into MAX's vitest suite over time. Not a blocker.

### 4.2 SBOS

**SBOS STAYS as the public open-core distribution. SBOS continues to receive code-flowed ports from `A1-ERP-HY` (the private R&D repo).**

Rationale:
- SBOS is the **public distribution surface**. Making it private would break consumer expectations.
- Its minimal scope (372 KB) is intentional — it's the **published** subset, not the full code.
- The README makes the design intent clear: SBOS is brand-neutral + open-core proposal; A1-ERP-HY is the full R&D.
- The Wave 2 work (i18n audit scanner, RBAC adapter tests, VAT rateband, chart-of-accounts helper) is **publication-grade**: re-tested, documented, brand-neutral. That's the right scope for SBOS.
- **SBOS's RBAC port is incomplete** vs. MAX — only 55+ tests vs. MAX's 7-contract tests. This is by design (the public distribution shows the contract, not the test matrix). **No action needed** — SBOS's RBAC is intentionally minimal for external consumers.

**Cutover path:** None. SBOS is correctly scoped.

### 4.3 The other three repos in scope

- `A1-Platform-MAX` — control plane. **Consumed by MAX** (referenced in MAX README: "Pluggable into A1-Platform-MAX for multi-tenant cloud"). No decision needed.
- `A1-ERP-HY` — private R&D. **Out of band** for this decision (not on GitHub in this session). When it appears, it should be the upstream that feeds SBOS (Wave N+1).
- `A1-AI-ERP-SBOS-MSTUDIO-sovereign` — air-gapped sovereign deployment (SBOSS). **Distinct product** (the "deployable sovereign image" vs. the "source code"). No conflict.

---

## 5. Final status table

| Repo | Role | Action |
|---|---|---|
| `A1-Suite-Local-MAX` | **Active live surface** for the A1 ERP suite. Where new code lands. | None — keep investing here. |
| `A1-Suite-Local-ANT` | **Frozen live** — stable v0.1.0 reference of the prototype-rooted implementation. Preserved for e2e test heritage + historical reference. | Tag at current head as `ant-v0.1.0-frozen`. Update `A1-portfolio/README.md` to mark as frozen. |
| `SBOS-A1-ERP` | **Public open-core distribution** — receives Wave N code-flow from `A1-ERP-HY`. | None — correctly scoped. |
| `A1-Platform-MAX` | Multi-tenant control plane (consumed by MAX). | None — no decision needed. |
| `A1-ERP-HY` | Private R&D upstream (out of band). | None — feeds SBOS Wave N+1. |
| `A1-AI-ERP-SBOS-MSTUDIO-sovereign` | Air-gapped SBOSS deployable image (distinct product). | None — distinct scope. |

---

## 6. What this decision unblocks

- **Architectural diagrams** in `A1-portfolio/ARCHITECTURE.md` can now be drawn with confidence: MAX is the canonical "active dev" layer, ANT is the frozen legacy reference, SBOS is the public distribution.
- **New features** (Phases 8, 9 of the agentic plan; future MAX-only work) land in MAX with no fork-and-merge burden.
- **Documentation** in `A1-portfolio/README.md` can use this matrix to point new contributors to MAX.
- **Karpathy eval branches** stay focused on MAX (the active surface), with ANT and SBOS getting their own focused branches.

---

## 7. What this decision does NOT do

- Does NOT delete ANT. ANT remains accessible, just frozen.
- Does NOT merge ANT into MAX. They have different code roots; merging would lose ANT's e2e heritage.
- Does NOT make SBOS private. SBOS is correctly public.
- Does NOT consolidate A1-ERP-HY into anything (out of band).
- Does NOT touch `A1-Platform-MAX` (different concern).
- Does NOT change the portfolio health-check invariants.

---

## 8. Rollout

1. ✅ **Tag ANT at current head as `ant-v0.1.0-frozen`.** Both SamStep74 and Armosphera mirrors.
2. ✅ **Update `A1-portfolio/README.md`** to mark ANT as frozen and point to MAX as active.
3. ✅ **Update `A1-portfolio/ARCHITECTURE.md`** with the product matrix table.
4. ✅ **Verify health check** still passes (15 repos, exit 0).

Long-term (not blocking):
- Port ANT's e2e tests into MAX's vitest suite over weeks/months.
- When `A1-ERP-HY` Wave N+1 lands, port through SBOS as designed.

---

*Status: APPROVED 2026-06-21 by portfolio owner. Closes the last open question in `ARCHITECTURE.md`.*