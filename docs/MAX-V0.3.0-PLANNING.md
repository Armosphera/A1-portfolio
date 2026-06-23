# A1 MAX v0.3.0 — Planning

**Target release:** 2026-07-15 (after HH dual-write window)
**Source:** SamStep74/A1-Suite-Local-MAX + Armosphera mirror
**Status:** Planning

---

## What shipped in v0.2.x

| Version | Date | Highlight |
|---|---|---|
| v0.2.0 | 2026-06-22 | First production-ready cut — Postgres adapter, e2e tests, trust/safety |
| v0.2.1 | 2026-06-23 | Mirror sync — both SamStep74 + armosphera have all waves |

What's solid:
- 119/119 e2e tests passing
- 18/18 trust/safety invariants verified
- Postgres workflow adapter + runtime factory
- 50+ workflow runtime tests (126 of 153 passing — 27 documented fixture rot)
- HH migration at 29/34 modules (100% of those with RBAC)

What's stable enough to ship next:
- 146+ tests passing on workflow runtime
- All 4 portfolio invariants green
- Mirror sync established

---

## Top 3 v0.3.0 candidates (by ROI)

### 1. **Batch executor parity with live writes** [HIGH ROI]

**Why:** Currently, workflows can `preview_first` (default mode) or `live_only`.
The batch mode (used by close-period, period-end jobs) writes multiple
steps at once. The existing tests don't cover batch executor + approval gate.

**What ships:**
- Batch executor test suite (8-10 tests)
- Batch + approval integration test
- Batch + audit trail test
- Failure recovery (compensating_actions in batch mode)

**Effort:** 4-6 hours of test work
**Value:** Closes last major untested path in workflow runtime

### 2. **27 workflow fixture fixes** [MEDIUM ROI]

**Why:** Per PRE-EXISTING-TEST-FAILURES.md, 27 tests fail due to
stale fixtures. These tests cover the parser + integration paths
but the fixtures predate stricter parser invariants.

**What ships:**
- Fix all 27 tests (mechanical + semantic changes)
- Bring workflow coverage from 82% to 95%+
- Clean up the last "red signal" in MAX

**Effort:** 4-6 hours of dedicated cleanup
**Value:** Removes documented technical debt, raises confidence

### 3. **Agent workbench UI** [MEDIUM-LOW ROI]

**Why:** The cockpit has 6 sections (Overview, Workflows, Inbox,
Agents, Finance Close, Audit). The Agents section currently shows
a placeholder. The full Agent Workbench UI lets operators:
- Browse available agents
- See real-time invocation traces
- Inspect cost budgets per agent
- Override autonomy levels per tenant

**What ships:**
- `/cockpit/agents` page (currently placeholder)
- 4 React components (AgentList, AgentTrace, AgentCost, AgentSettings)
- 5+ UI tests
- i18n: trilingual (hy/en/ru)

**Effort:** 8-12 hours (substantial UI work)
**Value:** Completes the cockpit feature set

---

## Smaller v0.3.0 candidates

### 4. **Cockpit UX polish** [LOW ROI]
- Drag-drop for approval cards
- Dark mode toggle
- Keyboard navigation

### 5. **Cross-portfolio observability** [LOW ROI]
- Per-repo test count trends
- Weekly report digest
- Slack notifications on cron failures

### 6. **MAX release notes automation** [LOW ROI]
- Auto-generate from git log + test results
- One command per release

---

## v0.3.0 release candidate

**If we ship only #1 + #2:**
- v0.3.0 = "Workflow runtime coverage complete"
- 153/153 workflow tests passing
- 119/119 e2e tests passing
- All 9 trust/safety invariants
- Postgres adapter production-ready

**If we ship #1 + #2 + #3:**
- v0.3.0 = "MAX cockpit complete"
- 153/153 workflow tests
- 119/119 e2e tests
- 6-section cockpit fully functional
- 9 trust/safety invariants

**Recommended:** Ship #1 + #2 in v0.3.0, defer #3 to v0.3.1.

---

## Timeline

| Date | Milestone |
|---|---|
| 2026-07-08 | v0.3.0-rc1 (release candidate) |
| 2026-07-15 | v0.3.0 (production release) |
| 2026-07-22 | HH dual-write window closes (independent) |

---

## Migration impact (HH)

v0.3.0 ships HH-independent. The HH dual-write window (closes
2026-07-22) is on a separate timeline. After Day 30:
- Drop `audit_events` write from `rbac-engine.ts`
- Delete `src/modules/auth/permissions.ts`
- Decommission `hh-rbac-parity-check.sh` cron

---

## Cross-references

- v0.2.0 release notes: `docs/MAX-V0.2.0-RELEASE-NOTES.md`
- v0.2.1 (mirror sync): see git tag
- Pre-existing test failures: `docs/PRE-EXISTING-TEST-FAILURES.md`
- HH cutover status: `docs/HH-CUTOVER-STATUS.md`
- Trust/safety: `docs/PHASE-8-TRUST-SAFETY.md`

---

*Created 2026-06-23.*
