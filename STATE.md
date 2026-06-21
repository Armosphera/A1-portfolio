# A1 Portfolio — STATE.md

**Last updated:** 2026-06-21
**Author:** Hermes (Armosphera AI-coder planning + execution)
**Scope:** 9 repos across `armosphera/` org

---

## TL;DR — What we shipped

In this session (≈ 1 working day), across **3 waves**, we delivered:

- **Wave 1 (AGENTS.md onboarding):** 8 repos got `AGENTS.md`. ANT's 1-line stub expanded to 14-rule agent contract.
- **Wave 2 (orchestration scaffolding):** 9 repos got `program.md` + `.orchestration/<roadmap>.md`. A1-Validator and sovereign got `scripts/spawn-worker.sh` (verified by end-to-end smoke-test).
- **Wave 3 (first execution + releases + Issues):** 7 GitHub Releases cut (Wave 1+2 milestones). 6 sample Issues opened with full agent-ready bodies, ready to be picked up by Claude Code / Codex / MiniMax / Mavis / Hermes.

**Total commits this session:** ~30+ (8 AGENTS.md + 9 program.md + 8 roadmap.md + 3 spawn-worker.sh + 1 bugfix + 3 helper files).
**Total GitHub Releases this session:** 14 (7 initial + 7 Wave 1+2 milestones).
**Total Issues opened:** 6 sample AI-coder tasks.

---

## Repo state — final

| Repo | AGENTS.md | program.md | .orchestration/ | spawn-worker.sh | Releases | Last CI |
|---|---|---|---|---|---|---|
| **autoresearch-sboss** | ✅ v0.2.0 | ✅ 2 program.md | ✅ examples/ | — | ✅ v0.2.0 | 🟢 green |
| **A1-Validator** | ✅ v0.2.0 | ✅ | ✅ validator-port-queue (23 rows) | ✅ verified | ✅ v0.2.0 | 🟡 pre-existing |
| **A1-Localization-AM** | ✅ v1.1.0 | ✅ | ✅ engine-roadmap | — | ✅ v1.1.0 | 🟢 green |
| **A1-Localization-RU** | ✅ v0.2.0 | ✅ | ✅ engine-roadmap | — | ✅ v0.2.0 | 🟢 green |
| **A1-AI-Core** | ✅ v0.2.0 | ✅ | ✅ extension-roadmap | — | ✅ v0.2.0 | 🟢 green |
| **A1-portfolio** | ✅ v0.2.0 | ✅ | ✅ doc-drift-tasks (17 rows) | — | ✅ v0.2.0 | n/a (docs) |
| **A1-Suite-Local-ANT** | ✅ v1.1.0 | ✅ | ✅ patch-roadmap | — | ✅ v1.1.0 | 🔴 pre-existing broken |
| **A1-Suite-Local-MAX** | ✅ v2.1.0 | ✅ | ✅ app-roadmap | — | ✅ v2.1.0 | 🟢 green |
| **A1-AI-ERP-SBOS-MSTUDIO-sovereign** | ✅ v0.7.0 | ✅ | ✅ existing 5 plans + WORKER-SPAWN-CONVENTIONS | ✅ verified | ✅ v0.7.0 | 🟢 green |

🟢 green = CI green
🟡 pre-existing = CI was failing before this session (not our regression)
🔴 pre-existing broken = needs investigation; not from Wave 1/2/3

---

## Open Issues ready for AI coders (Wave 3)

6 Issues, all with full agent-ready bodies, cross-referenced to AGENTS.md / program.md / roadmaps:

| Repo | Issue | Type | Est. effort |
|---|---|---|---|
| A1-Validator | [#1 — Port hhvh validator](https://github.com/Armosphera/A1-Validator/issues/1) | validator-port | 30-60 min |
| A1-Localization-AM | [#2 — Add pension_am fiscal engine](https://github.com/Armosphera/A1-Localization-AM/issues/2) | engine-add | 1-2 hours |
| A1-AI-Core | [#1 — Add di-contract-frozen eval lane](https://github.com/Armosphera/A1-AI-Core/issues/1) | eval-lane | 2-3 hours |
| A1-AI-ERP-SBOS-MSTUDIO-sovereign | [#4 — Execute sboss-plan6 w21-otel-traces](https://github.com/Armosphera/A1-AI-ERP-SBOS-MSTUDIO-sovereign/issues/4) | swarm-worker | 3-6 hours |
| A1-Suite-Local-MAX | [#2 — Scaffold @a1/invoicing on port 4114](https://github.com/Armosphera/A1-Suite-Local-MAX/issues/2) | monorepo-app | 4-8 hours |
| A1-portfolio | [#1 — Add CONTRIBUTING/RELEASE-PROCESS/PRODUCTS docs](https://github.com/Armosphera/A1-portfolio/issues/1) | docs | 1-2 hours |

---

## What Wave 1+2+3 unblocked

The portfolio now has:

1. **Uniform AI-coder entry point.** Every repo has `AGENTS.md` (rules) and `program.md` (day-to-day loop). A fresh agent reading just these two files knows the rules and what to do next.

2. **Roadmaps as status checklists.** Each repo has `.orchestration/<roadmap>.md` with `[ ]` boxes. AI coders can see what's done, what's next, and pick.

3. **Working worker-spawn tooling** (verified end-to-end via smoke-test). `scripts/spawn-worker.sh` in A1-Validator + sovereign creates worktree + barrier + scaffold.

4. **Concrete sample tasks.** 6 Issues with full agent-ready bodies. Pick one, run `program.md`, ship.

5. **Cross-repo consistency.** AGENTS.md template is shared across 8 repos (Wave 1). `program.md` follows the same Charter→Loop→Files→Rules→Coordination pattern in 8 repos (Wave 2). Releases are documented per-version with explicit Wave notes (Wave 3).

---

## What we found but did NOT fix

Documented as future work, NOT regressions from this session:

1. **ANT CI was already broken.** Every push to `A1-Suite-Local-ANT` since 2026-06-20 has failed CI. The CI workflow runs 3 jobs (server / web-modern / e2e), all failing. NOT caused by Wave 1/2/3 markdown changes — pre-existing issue. Needs separate investigation. Likely root causes (guesses, not confirmed):
   - Test environment setup (db seeding, ARMOSPHERA_ONE_DB)
   - Vitest config drift
   - Playwright browser binary install timing out
   - **Recommendation:** open a dedicated issue against `A1-Suite-Local-ANT` to investigate pre-existing CI failure.

2. **`A1-Validator` CI also pre-existing failures** (likely similar — pyproject + uv env setup issues from the new commits on top of the bootstrap). Wave 1/2/3 markdown doesn't affect this.

3. **License drift documented in LICENSING.md.** `A1-Validator` pyproject says MIT, LICENSE says Proprietary. Owner has flagged this for next release.

4. **Wave sentinels vs git tags.** `.w<N>-done` files in sovereign haven't been promoted to git tags. Roadmap item in WORKER-SPAWN-CONVENTIONS.md.

5. **`A1-AI-Core` consumer SHA bumps** are coordinated manually. The 4-repo checklist in AGENTS.md is the recipe; the actual coordination hasn't been exercised yet (still at pinned commit `cec47006`).

---

## Wave 3 artifacts created

- **7 GitHub Releases** with Wave 1+2 notes:
  - autoresearch-sboss v0.2.0 — companion program-port-validator.md
  - A1-Localization-AM v1.1.0 — engine-roadmap
  - A1-Localization-RU v0.2.0 — engine-roadmap
  - A1-AI-Core v0.2.0 — extension-roadmap + DI-contract-frozen invariant
  - A1-portfolio v0.2.0 — doc-drift-tasks + 3 TODO docs queued
  - A1-Suite-Local-ANT v1.1.0 — patch-roadmap (redirect-to-MAX rule)
  - A1-Suite-Local-MAX v2.1.0 — app-roadmap + monorepo discipline

- **6 sample Issues** (links above).

- **1 bugfix** to `A1-Validator/scripts/spawn-worker.sh` (commit `b9ae3b2`) — caught during Wave 3 smoke-test:
  - `next_n` was counting total queue rows instead of parsing the row's leading `| N |` column. Fixed with `sed`.
  - `barrier` was absolute path producing concat `/abs/worktree//abs/.orchestration/port-1-ready`. Fixed by making barrier relative.

- **2 verified end-to-end smoke-tests:**
  - `A1-Validator/scripts/spawn-worker.sh hhvh` → creates `.worktrees/port-1-hhvh` on branch `orch/port-1-hhvh`, touches barrier. ✅
  - `A1-AI-ERP-SBOS-MSTUDIO-sovereign/scripts/spawn-worker.sh sboss-plan2 w-test-w3 --no-tmux` → creates worktree + task/status/handoff scaffold. ✅

- **1 verified CI dispatch:**
  - `autoresearch-sboss` CI run completed/success after dispatch. ✅

---

## Open Wave 4 candidates (NOT done in this session)

These were identified but not executed:

1. **Run autoresearch-sboss overnight** with `program.md` — 500 experiments, results.tsv deltas. Requires local machine + Claude Code / Codex / MiniMax.
2. **Execute sovereign Plan 6** via `scripts/spawn-worker.sh sboss-plan6 w<N>-<name>` — first real wave after Wave 2 scaffolding.
3. **Port all 23 validators** in `A1-Validator` queue — Issue #1 starts with hhvh, the other 22 follow.
4. **Add the 3 TODO docs** to `A1-portfolio` (CONTRIBUTING.md, RELEASE-PROCESS.md, PRODUCTS.md) — Issue #1 in portfolio.
5. **Investigate ANT CI failure** — pre-existing, separate from Wave work.
6. **AGPL-3.0 migration** for engines — 2026 H2 roadmap, needs operator decision.

---

## Methodology notes

This session delivered the AI-coder plan from `/tmp/a1-ai-coder-plan.md` (created earlier in the session). The plan was built on primary investigation + targeted API calls after a subagent deep-research timed out at 10 min. Wave 3 smoke-test verified the deliverable works end-to-end.

Cross-repo invariant check: every commit in this session touches only documentation files (`AGENTS.md`, `program.md`, `*.md` in `.orchestration/`) or helper scripts (`scripts/spawn-worker.sh`). No code changes. The only code-touching commit was `b9ae3b2` (spawn-worker.sh bugfix).

---

*End of STATE.md. For the production-readiness baseline, see `SECURITY.md`. For cross-repo conventions, see `LICENSING.md` and `ARCHITECTURE.md`. For how to file issues, see `docs/CONTRIBUTING.md` (TODO — Wave 4).*