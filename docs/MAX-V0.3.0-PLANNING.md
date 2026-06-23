# A1 MAX v0.3.0 — Planning

**Target release:** 2026-07-15
**Source:** SamStep74/A1-Suite-Local-MAX + Armosphera mirror
**Status:** ✅ Candidate #1 COMPLETE; rc1 + rc2 released

---

## What's shipped (as of 2026-06-23)

| Version | Date | Highlight |
|---|---|---|
| v0.2.0 | 2026-06-22 | First production-ready cut |
| v0.2.1 | 2026-06-23 | Mirror sync (SamStep74 ↔ armosphera) |
| v0.2.2 | 2026-06-23 | +5 package.json exports |
| v0.2.3 | 2026-06-23 | 1496 tests passing |
| **v0.3.0-rc1** | 2026-06-23 | +12 batch executor tests (1508 tests) |
| **v0.3.0-rc2** | 2026-06-23 | +3 batch edge cases (1546 tests) |

**Candidate #1 (batch executor parity) — ✅ COMPLETE.**

15 batch executor tests across rc1 + rc2 cover:
- parseWorkflow with action_batch + human_approval
- countActionBatches (single + multi)
- countWriteProposals (write vs read distinction)
- assertBatchHonorsGuardrails (passes when approval exists)
- audit trail integration
- approval inbox (requestApproval shape)
- rollback declarations (manual_only)
- mixed-effect batches (read + write in same step)
- idempotency uniqueness across runs
- approval request records batch tools in proposedActions

---

## What's still pending for v0.3.0 final

### 2. **27 workflow fixture fixes** [MEDIUM ROI]

Status: **Partially resolved** — most were fixed via SamStep74 merge
in v0.2.1 + additional agent barrel exports in v0.2.2 + package.json
exports in v0.2.3.

Current state: 0 failures in workflow/, 0 failures in agent/,
0 failures in karpathy-eval/. **No more fixture rot to fix.**

### 3. **Agent workbench UI** [MEDIUM-LOW ROI]

Status: **Deferred to v0.3.1** (per original planning).

This is a substantial UI effort (8-12 hours) that doesn't impact
production stability. Better as a dedicated session.

---

## Top 3 v0.3.0 candidates (by ROI)

### 1. **Batch executor parity** [HIGH ROI] ✅ COMPLETE

- 4-6 hours of test work
- Closes last major untested path in workflow runtime
- **Status: Done in v0.3.0-rc1/rc2**

### 2. **Workflow fixture fixes** [MEDIUM ROI] ✅ RESOLVED VIA MERGES

- 4-6 hours of dedicated cleanup
- Brings workflow coverage from 82% to 95%+
- **Status: Resolved incidentally via v0.2.1/2.2/2.3 (SamStep74 merge + exports)**

### 3. **Agent workbench UI** [MEDIUM-LOW ROI] ⏸️ DEFERRED

- 8-12 hours of substantial UI work
- **Status: Deferred to v0.3.1**

---

## v0.3.0 release candidate composition

**If we ship v0.3.0 today**:
- 1546 tests passing (vs 1187 at session start = +359 tests)
- Batch executor end-to-end coverage
- Mirror sync maintained
- 6 release tags (v0.2.0 → v0.3.0)
- 24 portfolio docs published
- HH Day 30 cutover validated via dry-run

**Recommended:** Promote v0.3.0-rc2 → v0.3.0 (final) within 1 week
if no regressions in CI.

---

## Smaller candidates (now or later)

### 4. **Cockpit UX polish** [LOW ROI]
- Drag-drop for approval cards
- Dark mode toggle
- Keyboard navigation

### 5. **Cross-portfolio observability** ✅ DONE
- `scripts/portfolio-test-counts.sh` shipped
- `docs/PORTFOLIO-TEST-TRENDS.md` initial snapshot
- 10,048 tests counted across 14 repos (1 never_created)

### 6. **MAX release notes automation** [LOW ROI]
- Auto-generate from git log + test results
- One command per release

---

## What's NOT changing

- HH dual-write window: stays open until 2026-07-22
- HH Day 30 cutover: dry-run validated on `dry-run/day-30-cutover` branch
- ANT: frozen per PRODUCTS.md, 110 stale branches already deleted
- MAX mirror sync: maintained

---

## Cross-references

- v0.2.x release notes: `docs/MAX-V0.2.0-RELEASE-NOTES.md`
- v0.3.0 planning: this file
- Pre-existing test failures: `docs/PRE-EXISTING-TEST-FAILURES.md` (now historical)
- HH cutover plan: `docs/HH-CUTOVER-PLAN.md`
- Trust/safety: `docs/PHASE-8-TRUST-SAFETY.md`
- Portfolio trends: `docs/PORTFOLIO-TEST-TRENDS.md`

---

*Updated 2026-06-23 by Adi. Candidate #1 complete; ready for v0.3.0 final tag.*
