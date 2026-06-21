# Cross-Repo Coordination Playbook

**Effective:** 2026-06-21
**Owner:** Armosphera LLC

This document captures the **concrete coordination recipes** for the cross-repo
changes that come up in the A1 portfolio. Each pattern has been exercised at
least once (see git history); the recipes below are the canonical version.

## TL;DR — when you change repo X, here's the ripple

| If you change... | Then update... |
|---|---|
| `@a1/ai` (A1-AI-Core) — additive (new field, new export) | NONE (consumers stay on current SHA) |
| `@a1/ai` (A1-AI-Core) — breaking (rename, remove) | MAX, ANT, autoresearch-sboss, A1-portfolio docs — coordinated |
| `A1-Localization-{AM,RU}` public API | All 4 consumers re-vendor (ANT, MAX, sovereign, SBOS-A1-ERP) |
| `A1-Validator` (PyPI release) | None (consumers `pip install a1-validator`) — but bump version + tag |
| A1-Suite-Local-MAX (new app / breaking) | ANT absorbs parity if MAX surpasses; coordinate |
| A1-Suite-Local-ANT (live patch) | None — sovereignty contract is locked via Karpathy eval lanes |
| Sovereign (new plan / wave) | Self-contained within the plan's `.orchestration/<plan>/` |
| A1-portfolio (meta-docs) | None (this is read-only by convention) |

## Recipe 1: `@a1/ai` additive change (new field)

**Trigger:** Adding a new optional field to `createAi()` or a new export.

**Pre-conditions:**
- The change is backwards-compatible
- Within the same minor version

**Steps:**

1. Make the change in `A1-AI-Core`:
   ```bash
   cd armosphera/A1-AI-Core
   git checkout -b feat/<scope>
   # edit src/, index.js
   ```

2. Add a test for the new field (TDD: red → green).

3. Update `evals/di-contract-frozen/check.js`:
   - If new field: add to `EXPECTED_FIELDS` (new fields go at the END)
   - If new export: add to `EXPECTED_EXPORTS`

4. Run the eval lane locally:
   ```bash
   node evals/di-contract-frozen/check.js
   # Should report 6/6 PASS (or N/N if you added checks)
   ```

5. Open a PR. CI runs `di-contract-frozen` automatically.

6. After merge:
   ```bash
   # Cut a new MINOR version
   git tag v0.X.Y
   git push origin v0.X.Y
   gh release create v0.X.Y --title "..." --notes "..."
   ```

7. **No consumer action.** Consumers stay on their current pinned SHA. They
   can optionally bump, but it's not required.

**Estimated time:** ~1-2 hours per change.

## Recipe 2: `@a1/ai` breaking change (rename, remove)

**Trigger:** Renaming or removing a field/export. **STOP** — this is a MAJOR version bump.

**Pre-conditions:**
- Operator approval for the breaking change
- All 4 consumers coordinated

**Steps:**

1. Open a discussion issue in `A1-AI-Core`:
   ```
   Title: BREAKING: <description>
   Body:
     - Current contract: <what changes>
     - New contract: <what replaces it>
     - Rationale: <why>
     - Consumer impact: <how each of 4 consumers is affected>
     - Rollback plan: <how to revert if consumers can't migrate>
     - Migration deadline: <date after which consumers must bump>
   ```

2. Wait for operator + consumer-team approval. **Do not commit.**

3. After approval, make the change in `A1-AI-Core`:
   ```bash
   # In A1-AI-Core
   git checkout -b breaking/v1.0.0-<scope>
   # edit src/, index.js
   # update EXPECTED_FIELDS / EXPECTED_EXPORTS in eval lane
   ```

4. Cut the MAJOR release first (AI-Core leads):
   ```bash
   # In A1-AI-Core
   git tag v1.0.0
   git push origin v1.0.0
   gh release create v1.0.0 --title "..." --notes "..."
   # Note the commit SHA consumers will pin to
   ```

5. **Then** bump consumers in this order (each is its own PR):

   | # | Consumer | PR scope |
   |---|---|---|
   | 1 | `A1-Suite-Local-MAX` | `package.json` → `@a1/ai: "git+https://github.com/Armosphera/A1-AI-Core.git#<new-sha>"`, run `npm run verify` |
   | 2 | `A1-Suite-Local-ANT` | Same as MAX + run e2e nightly |
   | 3 | `autoresearch-sboss` | Verify `scripts/karpathy-eval.mjs` still loads (may need `EXPECTED_FIELDS` update) |
   | 4 | `A1-portfolio` | Update pinned SHA in `ARCHITECTURE.md` |

6. After all 4 consumer PRs land, close the original discussion.

**Estimated time:** ~1 sprint (5-7 days) per breaking change.

## Recipe 3: Add a new fiscal engine to `A1-Localization-{AM,RU}`

**Trigger:** Adding a new pure-function module under `src/` + tests + README update.

**Pre-conditions:**
- Primary source identified (RA MoF / SRC for AM, НК РФ / Минфин for RU)
- Cited in commit body

**Steps:**

1. Work in the engine repo:
   ```bash
   cd armosphera/A1-Localization-AM  # or RU
   git checkout -b feat/<engine-name>
   ```

2. TDD:
   - Add `test/<engine>.test.js` with real fixtures (RED)
   - Run `npm test` → confirm failure
   - Add `src/<engine>.js` (GREEN)
   - Re-export from `index.js`
   - Update README.md module table
   - Update SOURCES.md

3. Run the gate:
   ```bash
   npm test  # coverage guard for non-*.data.js
   ```

4. Open a PR. CI runs across node 18/20/22 + CodeQL.

5. After merge, **notify 4 consumers** to re-vendor:
   - `A1-Suite-Local-ANT` — `server/vendor/a1-localization-am/`
   - `A1-Suite-Local-MAX` — `packages/.../vendor/...`
   - `A1-AI-ERP-SBOS-MSTUDIO-sovereign` — under `sboss-locale/`
   - `SBOS-A1-ERP` — under `server/`

   For each, file a coordinated issue: "Re-vendor after <engine> addition in
   A1-Localization-AM vX.Y.Z".

**Estimated time:** ~1-2 hours per engine (regulatory research is the long pole).

## Recipe 4: Port a SBOSS validator into A1-Validator

**Trigger:** Adding a new validator to the Python package.

**Steps:**

1. Spawn a worker via the Wave 2 scaffolding:
   ```bash
   cd armosphera/A1-Validator
   bash scripts/spawn-worker.sh <validator-name>
   ```
   This creates `.worktrees/port-N-<name>` on branch `orch/port-N-<name>` and
   touches `.orchestration/port-N-ready`.

2. Work in the worktree:
   ```bash
   cd .worktrees/port-N-<name>
   git checkout orch/port-N-<name>  # already on it
   ```

3. TDD:
   - Add `<Name>Result` to `src/a1_validator/results.py` (Pydantic v2 model)
   - Add `src/a1_validator/_vendored/<name>.py` (the validator body)
   - Re-export from `src/a1_validator/__init__.py` + add to `validate()` dispatcher
   - Add tests in `tests/test_validators.py` with real fixtures
   - Run `pytest --cov=a1_validator --cov-fail-under=80`

4. Update README.md module table + CHANGELOG.md.

5. Commit with `feat(validator): port <name> from autoresearch-sboss`.

6. Touch `.orchestration/port-N-done` barrier.

7. Push branch, open PR.

**Estimated time:** ~30-60 minutes per validator.

## Recipe 5: Add a new app to MAX monorepo

**Trigger:** Scaffolding a new `@a1/<app>` on a new port.

**Steps:**

1. Copy structure from most similar existing app:
   ```bash
   cd armosphera/A1-Suite-Local-MAX/apps
   cp -r inventory/ invoicing/
   # Rename files, update package.json name + port
   ```

2. Wire into turbo pipeline (auto-detected via workspaces).

3. Add to `@a1/shell` launcher nav (`apps/shell/src/app/...`).

4. Add deploy profile (`deploy/compose.sh --profile invoicing`).

5. Tests (vitest unit + playwright e2e).

6. Run the gate:
   ```bash
   npm run verify
   # audit → typecheck → lint → test → build → e2e → integrations → docker:build
   ```

7. Update `deliverable.md` sprint narrative.

**Estimated time:** ~4-8 hours per app (full scaffold + tests + verify).

## Recipe 6: Execute a sovereign swarm plan

**Trigger:** New plan in `docs/superpowers/plans/`.

**Steps:**

1. Read the plan + WORKER-SPAWN-CONVENTIONS.md.

2. For each worker:
   ```bash
   cd armosphera/A1-AI-ERP-SBOS-MSTUDIO-sovereign
   bash scripts/spawn-worker.sh <plan> <worker-name>
   # Creates worktree + task/status/handoff scaffold + (optionally) tmux pane
   ```

3. Edit `.orchestration/<plan>/<worker>/task.md` (fill Objective, Barriers, Completion).

4. Work in the worktree (TDD, coverage ≥80%).

5. Touch `.w<N>-done` barrier when shipped.

6. Write `.orchestration/<plan>/<worker>/handoff.md` with results.

7. Update `.orchestration/<plan>/STATE.md`.

8. Push branch, open PR.

9. After all plan workers ship, cut a coordinated release tagged with the
   corresponding plan number (e.g. `v0.8.0` for Plan 6).

**Estimated time:** ~3-7 days per plan (depends on worker count).

## Recipe 7: Patch the LIVE deploy (ANT)

**Trigger:** Bug fix or sovereignty hardening on `A1-Suite-Local-ANT`.

**Pre-conditions:**
- This is the live deploy; customer data may be on disk.
- The change is a PATCH (not new surface area). For new surface, redirect to MAX.

**Steps:**

1. Branch from `ant/main` (not `main`):
   ```bash
   cd armosphera/A1-Suite-Local-ANT
   git checkout -b fix/<scope> ant/main
   ```

2. Make the change + tests.

3. Run the gates:
   ```bash
   npm run check
   npm run karpathy:run -- egress-policy-contract  # MUST stay green
   ```

4. Update HANDOFF.md (implementation narrative) + DEPLOYMENT.md if relevant.

5. Open a PR.

6. After merge to `main`, the deploy picks it up on next `deploy/install.sh` run
   or `docker pull`.

**Estimated time:** ~1-3 hours per patch.

## Recipe 8: Cross-repo docs update (LICENSING.md, ARCHITECTURE.md, etc.)

**Trigger:** Repo added, deprecation, license change, layer reorganization.

**Steps:**

1. Update `A1-portfolio/expected-repos.json` (canonical list).

2. Update `A1-portfolio/README.md`, `LICENSING.md`, `ARCHITECTURE.md`,
   `SECURITY.md` to match.

3. Run `scripts/check-portfolio-drift.js` locally:
   ```bash
   cd armosphera/A1-portfolio
   node scripts/check-portfolio-drift.js
   ```

4. CI runs the same check on push/PR.

5. Open a single PR with all 4 doc updates + the expected-repos.json change.

**Estimated time:** ~30-60 minutes per docs update.

---

*Companion to `AGENTS.md` + `CONTRIBUTING.md` + `RELEASE-PROCESS.md`. This file =
"how to coordinate changes across the 9 repos." Recipes are versioned with
the repo state; if a recipe stops working, open an issue.*