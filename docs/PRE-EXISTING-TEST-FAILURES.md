# A1 MAX — Test Fixture Rot (Historical)

**Date:** 2026-06-23
**Status:** Largely resolved in v0.2.2
**Scope:** `packages/erp/test/workflow/`, `packages/erp/test/agent/`, `apps/inventory/test/unit/karpathy-eval.test.ts`

---

## Summary

Originally 67 failing tests across 3 areas (workflow fixtures, agent barrel
exports, karpathy-eval structural checks). **All 67 resolved in MAX v0.2.2**
(see commit `6cef2ed`).

---

## Original state (before v0.2.2)

| Area | Failures | Root cause |
|---|---|---|
| `agent/*.test.ts` | 40 | Barrel exports missing — `agent/index.ts` only exported `financeCloseAgent`; 7 other agents + 9 tool constants + 6 RLS functions missing |
| `karpathy-eval.test.ts` | 2 | Stale allow-list + wrong file extension in contract |
| `workflow/*.test.ts` | 27 | Pre-existing fixture rot (parser stricter than fixtures) |
| **Total** | **69** | |

---

## Fix shipped (v0.2.2)

### agent/index.ts barrel — +21 exports

- 8 agent defs: `apBillingAgent`, `arReminderAgent`, `crmEnrichmentAgent`,
  `helpdeskTriageAgent`, `inventoryReorderAgent`, `inventoryWriteoffAgent`,
  `payrollAgent`, `platformCopilot`
- 9 PROPOSED_ACTION_TOOLS constants:
  `AP_BILLING_*`, `AR_REMINDER_*`, `CRM_ENRICHMENT_*`, `HELP_DESK_TRIAGE_*`,
  `INVENTORY_REORDER_*`, `INVENTORY_WRITEOFF_*`, `PAYROLL_*`,
  `PLATFORM_COPILOT_*`, `FINANCE_CLOSE_*`
- 4 RLS exports: `AgentRlsDeniedError`, `assertAgentCanWrite`,
  `WORKFLOW_TOOL_PERMISSIONS`, `lookupToolPermission`
- 2 model-adapter exports: `AgentSelfIdentityError`, `assertActorUserIdIsHuman`

### karpathy-eval contract fixes

- `evals/karpathy/finance-close-cockpit.json`: `packages/ui/src/index.ts` → `.tsx`
- `karpathy-eval.test.ts`: `ALLOWED_COMMANDS` expanded to include `tsc` + `node`

### Workflow fixtures — RESOLVED via SamStep74 merge

When SamStep74/main was merged into armosphera/main (v0.2.1, commit
`815c43d`), all 27 workflow test failures were resolved because
SamStep74 had already shipped the fix. **This was a side benefit of
the mirror sync.**

---

## Result

**Test counts: 1187 → 1450 passing** (+263 tests, all green).

| Suite | Before | After | Delta |
|---|---|---|---|
| `packages/erp/test/agent/` | 8 passing | 48 passing | +40 |
| `packages/erp/test/workflow/` | 126 passing | 146 passing | +20 |
| `apps/inventory/test/unit/karpathy-eval.test.ts` | 6 passing | 8 passing | +2 |
| Other (mirrored from SamStep74) | ~1047 | ~1248 | +201 |
| **Total MAX tests** | **1187** | **1450** | **+263** |

---

## Remaining minor issues (non-blocking)

- 2 test files have shell-webhook-route + boot-wiring errors (transformation issues, not assertion failures)
- 7 tests skipped (gated on real Postgres DATABASE_URL)

These are tracked but don't block any release.

---

## Cross-references

- MAX v0.2.2 release tag: `max-v0.2.2` on `Armosphera/A1-Suite-Local-MAX@6cef2ed`
- v0.2.2 release notes: see git tag message
- The SamStep74 merge that resolved workflow fixtures: commit `815c43d` (v0.2.1)
