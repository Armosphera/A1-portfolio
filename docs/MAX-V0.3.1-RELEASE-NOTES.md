# A1 Suite Local MAX — v0.3.1 Release Notes

**Release date:** 2026-06-23
**Tag:** `max-v0.3.1`
**Commit:** `35962db` on `Armosphera/A1-Suite-Local-MAX/main`
**Repository:** https://github.com/Armosphera/A1-Suite-Local-MAX

---

## TL;DR

**MAX v0.3.1 completes the cockpit feature set** by wiring the Agent
Workbench UI into the cockpit routing. The 256-line `AgentWorkbenchClient.tsx`
(already shipped in earlier waves) is now reachable at `/cockpit/workbench`
alongside the other 5 cockpit sections.

**Test count: 1560/1560 passing** (+6 from new smoke tests).

---

## What's new in v0.3.1

### Cockpit section: Agent Workbench

- **Route**: `/cockpit/workbench`
- **Page entry**: `apps/shell/src/app/cockpit/workbench/page.tsx`
- **Client component**: `apps/shell/src/components/cockpit/AgentWorkbenchClient.tsx` (already 256 lines)

### Features (from the existing client component)

- **Status tiles**: agent count by status (active/idle/paused/error)
- **Agent table**: 9 MAX V1 agents with autonomy level, owner role, cost budget
- **Inspect side panel**: drill into a single agent, view its config + cost budget
- **DecisionCard**: operator can evaluate() agent context + see suggested decisions
- **Trilingual support**: hy/en/ru via `@a1/i18n`
- **UI components**: Card, Badge, Button, ProgressBar via `@a1/ui`

### Tests

6 smoke tests in `apps/shell/test/unit/cockpit-workbench.test.ts`:
- Page + client component files exist
- Page exports default component
- Client exports AgentWorkbenchClient
- Client uses `"use client"` directive
- Client imports AGENTS fixture
- Structure matches cockpit conventions

---

## Complete cockpit feature set

The cockpit is now fully implemented:

| Section | Route | Status |
|---|---|---|
| Overview | `/cockpit` | ✅ |
| Workflows | `/cockpit/workflows` | ✅ |
| Inbox | `/cockpit/inbox` | ✅ |
| Agents | `/cockpit/agents` | ✅ |
| **Workbench** | `/cockpit/workbench` | ✅ **NEW** |
| Finance Close | `/cockpit/finance-close` | ✅ |
| Audit | `/cockpit/audit` | ✅ |

---

## Compatibility matrix

| Component | v0.3.0 | v0.3.1 |
|---|---|---|
| Workflow runtime | ✅ | ✅ |
| Batch executor tests | 23 | 23 |
| Trust/safety invariants | 18 | 18 |
| Cockpit sections | 6 | **7** |
| Total tests | 1554 | **1560** |
| Release tags | 7 | **8** |

---

## Test counts

| Suite | Tests | Time |
|---|---:|---|
| MAX e2e (happy-dom) | 119 | 1.5s |
| MAX unit + workflow + agent | 1434 | varies |
| MAX Postgres integration | 7 | gated on real DB |
| **Total MAX tests** | **1560** | <5s |

---

## Production deployment

Same as v0.3.0 — no production changes needed:
- Set `DATABASE_URL`
- Apply migrations
- `npm run build && npm start`

The new Workbench page is included automatically in the build.

---

## HH migration parallel work

- 29/34 HH modules migrated (100% of those with RBAC)
- Day 30 cutover automation shipped (`scripts/hh-day-30-cutover.sh`)
- Day 30 cutover checklist shipped (`scripts/hh-cutover-checklist.sh`)
- Day 30 dry-run validated on `dry-run/day-30-cutover` branch
- 28 days remaining (closes 2026-07-22)

---

## Cross-references

- `docs/PRODUCTS.md` — MAX is active dev surface
- `docs/MAX-V0.3.0-PLANNING.md` — full v0.3.x planning
- `docs/HH-CUTOVER-PLAN.md` — Day 30 cutover dry-run
- `karpathy/hh-rbac-engine` — HH production branch

---

*Released 2026-06-23 by Adi.*
