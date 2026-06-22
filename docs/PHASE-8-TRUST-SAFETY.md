# A1 MAX — Phase 8 Trust and Safety Hardening

**Date:** 2026-06-22
**Status:** Verified at v0.2.0 release
**Scope:** `packages/erp/src/agent/` (Phase 5 agent layer)

---

## Overview

The MAX agent layer implements 9 trust/safety invariants per ADR-001 §D6
(Agent layer requirements). All 9 invariants are enforced at runtime,
not just at registration. The invariants are tested in
`packages/erp/test/agent-policy.test.ts` (12 tests) and exercised by
every agent integration test.

---

## The 9 Invariants

### 1. Write-Tool Forbidden (ADR §D6.2)

Agents NEVER execute write tools. They produce `proposedActions[]`
for human review.

**Where enforced:** `model-adapter.ts` (the only place that calls the LLM)
**Verification:** `runAgentWithDef` returns `proposedActions: ProposedAction[]`
but does NOT call any write API. The adapter's last step is proposal
assembly — it extracts proposals from structured output, never invokes
them.

### 2. Autonomy Levels (ADR §D6.1)

Four levels, enforced via `checkAutonomyLevel()` in `policy.ts`:

| Level | Meaning | Owner required? |
|---|---|---|
| `suggest` | Read-only + return proposal | No |
| `recommend` | UI may render directly | No |
| `act_with_approval` | Produces ProposedAction for approval inbox | Yes |
| `autonomous_sandbox_only` | Same, but sandboxFilter required on every source | Yes |

**Verification:** Test denies an unknown autonomy level with
`AGENT_AUTONOMY_FORBIDDEN`.

### 3. No Self-Approval (ADR §D2)

A user cannot approve their own agent proposal. `triggeredBy == approvedBy`
is forbidden.

**Where enforced:** `policy.ts::checkActorMayApprove`
**Verification:** `AGENT_SELF_APPROVAL_FORBIDDEN` for matching user IDs.

### 4. Input Schema Validation (ADR §D6.3)

Every agent declares `inputSchema` (type, required, description,
default). The model adapter validates inputs before invoking the LLM.

**Where enforced:** `policy.ts::checkInputValid`
**Verification:** `AGENT_INPUT_INVALID` for missing required fields.

### 5. Output Schema Validation (ADR §D6.3)

Structured output is validated against `outputSchema`. Invalid output
returns `AGENT_OUTPUT_INVALID` failure (no LLM retry).

**Where enforced:** `model-adapter.ts` provider invocation step
**Verification:** `rejects output that fails schema validation`.

### 6. RBAC for Invocation (ADR §D2)

A user can only invoke an agent if their role permits it.
`checkActorMayInvoke` enforces role hierarchy.

**Where enforced:** `policy.ts::checkActorMayInvoke`
**Verification:** `denies invocation by insufficient role` with
`AGENT_FORBIDDEN`.

### 7. Cost Budget (ADR §D6.4)

Each agent declares `costBudget: { perCallMicrocents, monthlyMicrocents }`.
Exceeding throws `AGENT_COST_BUDGET_EXCEEDED` before the LLM call.

**Where enforced:** `cost-logger.ts` + `model-adapter.ts`
**Verification:** ap-billing.test.ts asserts budget exceeded before provider call.

### 8. Per-Tenant RLS (ADR §D6.5)

Agents can only access data for the `orgId` in their `triggeredBy`
principal. Cross-tenant access throws.

**Where enforced:** `rls.ts` (Row-Level Security context builder)
**Verification:** `rls.test.ts` asserts cross-tenant `read` throws `RLS_VIOLATION`.

### 9. Tool Permissions (ADR §D6.6)

The agent declares `toolAllowlist: string[]`. The registry validates every
tool name against this list. Tools not in the allowlist throw
`AGENT_TOOL_FORBIDDEN`.

**Where enforced:** `registry.ts` (at registration + at invocation)
**Verification:** `registry.test.ts` asserts tool allowlist enforcement.

---

## Self-Approval Test (canonical)

```ts
it("denies self-approval: triggeredBy === approvedBy", () => {
  const principal = { userId: 'u-1', orgId: 'org-1', role: 'controller' };
  const result = checkActorMayApprove({
    triggeredBy: principal,
    approvedBy: principal,
  });
  expect(result.allow).toBe(false);
  expect(result.code).toBe('AGENT_SELF_APPROVAL_FORBIDDEN');
});
```

---

## Production deployment

The `runtime-factory.ts` (added in v0.2.0) wires all 9 invariants
automatically. Production deployments set DATABASE_URL and the
workflow runtime / agent registry / audit sink switch to Postgres-backed
implementations. The 9 invariants are enforced at the application
layer (TypeScript) — not just the database — so they apply to
InMemory dev mode AND Postgres production equally.

---

## Test counts (Phase 8 hardening)

| Test suite | Files | Tests |
|---|---|---|
| agent-policy.test.ts | 1 | 12 |
| agent/*.test.ts (integration) | 9 | 60+ |
| agent-integration.test.ts | 1 | 8 |
| rls.test.ts | 1 | 5 |
| Phase 8 total | 12 | 85+ |

All passing at v0.2.0.

---

## Cross-references

- `docs/PRODUCTS.md` — MAX is active dev surface
- `docs/ANT-BRANCHES.md` — 110 stale branches deleted
- `docs/E2E-PORT-TRACKER.md` — 119 ANT e2e tests ported
- `docs/PHASE-8-TRUST-SAFETY.md` — this file
- `Armosphera/A1-Suite-Local-MAX/packages/erp/src/agent/policy.ts` — implementation
- `Armosphera/A1-Suite-Local-MAX/packages/erp/test/agent-policy.test.ts` — 12 trust/safety tests
- ADR-001 §D2, §D6 (Agent layer requirements)
