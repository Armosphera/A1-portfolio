# A1 Portfolio — AI Coder Plan (Historical Reference)

**Effective:** 2026-06-21 (Wave 0 of this session)
**Status:** Historical — the plan that kicked off Wave 1+2+3+4+5+6+7+8 of the A1 portfolio AI-coder rollout.

This document is the **original strategic plan** that was produced at the start
of the AI-coder enablement session. It is preserved here as a **historical
reference** — the work it describes has been completed across Waves 1-7.

**TL;DR:** the plan called for 3 waves:

| Wave | Goal | Outcome |
|---|---|---|
| 1 | Add `AGENTS.md` to every A1 repo | ✅ Done — 9 repos |
| 2 | Add `program.md` + `.orchestration/` + worker-spawn tooling | ✅ Done — 9 repos |
| 3 | First overnight Karpathy eval runs end-to-end | ⚠️ Partial — eval-lane infrastructure verified in CI; full overnight runs deferred (need local machine + Claude Code) |

Subsequent waves (4-8) **extended the original plan** with strategic gaps:
drift-detection CI, dual-license prep, cross-repo coordination recipes,
portfolio polish, and real Karpathy lane inventory.

---

# A1 Portfolio — AI Coder Workflow Plan

**Date:** 2026-06-21
**For:** Claude Code · Codex · Hermes · Mavis · MiniMax · any other agent runtime
**Scope:** Help AI coders get the 9 armosphera repos to **production-ready** efficiently, safely, and without breaking the cross-repo invariant.

---

## TL;DR

The portfolio **already has a working AI-coder workflow** — it's just unevenly deployed across repos:

- ✅ **SBOS-A1-ERP** — gold standard: `AGENTS.md` (13 rules) + `DMUX_WORKFLOWS.md` + `node scripts/orchestrate-worktrees.cjs` + `.orchestration/*.json` plans + `WAVE-N-SUMMARY.md` reports
- ✅ **A1-AI-ERP-SBOS-MSTUDIO-sovereign** — most active swarm: 5 plans × ~5 workers each = ~25 parallel worktrees with `task.md / status.md / handoff.md` + `.w*-done` barriers
- ✅ **A1-Suite-Local-ANT** — Claude Code config (`.claude/launch.json`, `.claude/settings.json` with SessionStart hook) + 25+ sub-plans in `.orchestration/`
- ✅ **A1-Suite-Local-MAX** — uses same pattern, has `.orchestration/phase9-rbac/` and `.orchestration/ai-erp-agentic-workflow/`
- ✅ **autoresearch-sboss** — has the **Karpathy eval-loop charter** (`program.md`) that *any* agent can pick up and run overnight
- ⚠️ **A1-Localization-{AM,RU} / A1-Validator / A1-AI-Core / A1-portfolio** — no `AGENTS.md`, no `.orchestration/` — engines and meta-docs, lower AI-coder traffic

The plan below **codifies what already works in sovereign + SBOS** and propagates it to the rest. Estimated work: ~1 wave per repo + cross-repo glue.

---

## 1. Repo-by-repo AI-coder playbook

### 1.1 `armosphera/autoresearch-sboss` — Karpathy eval-loop

**Pattern:** This repo *is* an AI-coder harness. The agent's charter is `program.md`.

**How to onboard a coder (Claude Code / Codex / Mavis / MiniMax / Hermes):**
1. Open the repo, read `program.md` (50 lines, full charter).
2. Disable all permissions. Point the agent at `program.md`:
   > "Have a look at `program.md` and let's kick off a new experiment. Let's do the setup first."
3. Agent loops: read `results.tsv` → edit `workflow.py` → run `uv run eval.py` → keep or revert → log → repeat.
4. ~60 experiments/hour, ~500/night, keep rate 5–15%.

**Production-readiness work for AI coders:**
- [ ] Add `AGENTS.md` short pointer: "Read `program.md`. Don't edit `eval.py`, `eval_set.json`, `pyproject.toml`."
- [ ] Make `program.md` self-contained enough that a fresh agent with zero context can run it.
- [ ] Add a nightly cron that runs 100 experiments unattended and opens a PR with `results.tsv` deltas.
- [ ] Wire `results.tsv` → GitHub Issues auto-generation for plateau events.

**Bottlenecks:** None. This is the simplest agent flow in the portfolio.

---

### 1.2 `armosphera/A1-Validator` — Python package

**Pattern:** Standard Python project with `pyproject.toml` (pytest + ruff + mypy optional). 23 validators ported from `autoresearch-sboss`.

**For AI coders — what to read first:**
1. `AGENTS.md` (currently MISSING — add one)
2. `pyproject.toml` — note the `[tool.ruff]`, `[tool.pytest]`, `[tool.setuptools.package-data]` config
3. `src/a1_validator/_vendored/` — DO NOT edit vendored code (it's regenerated from upstream by `scripts/_vendor.py`)
4. `tests/_eval_sets/` — fixed corpus, do not edit
5. `scripts/check_pypi_oidc_readiness.sh` — pre-publish gate
6. `scripts/setup_pypi_token.sh` — PyPI auth

**Production-readiness work:**
- [ ] Add `AGENTS.md`: TDD rule + 80% coverage + "don't edit `_vendored/`" + reference to upstream `autoresearch-sboss` for validator source-of-truth
- [ ] Add `program.md`-style charter for "port one more validator from autoresearch-sboss" task
- [ ] Add `examples/` with worked validator-ports
- [ ] Wire pre-commit: ruff + mypy + pytest (currently not in CI)
- [ ] Add `.orchestration/wave-N-new-validator/` template (mirror sovereign's pattern)
- [ ] GH Actions matrix: python 3.10 / 3.11 / 3.12 (already exists in `ci.yml`)

**Bottlenecks:**
- Vendored code regenerates — agents might think they can edit it
- PyPI trusted-publisher 2FA step is **manual** — block publish-gate work on the operator

---

### 1.3 `armosphera/A1-Localization-{AM,RU}` — JS fiscal engines

**Pattern:** Pure-function libraries, zero runtime deps, vendored by 3 downstream apps. Each repo has `INTEGRATION.md` (recipe for vendors).

**For AI coders:**
- AM: 13 test files, 1.0.0 version, vendor-adopted
- RU: 8 test files, 0.1.0, vendor-adopted (8/8 test files = each src/*.js has tests)

**Production-readiness work:**
- [ ] Add `AGENTS.md` to both repos: "TDD, no `*.data.js` edits without bumping chart-of-accounts source URL, real registry-number fixtures only"
- [ ] Add `program.md` for "add one more fiscal engine" (e.g. add `pension_am` or `insurance_ru`)
- [ ] SOURCES.md audit: every rate must cite the official publication (already done in RU — verify AM matches)
- [ ] Add Karpathy eval lane `vendor-smoke-contract` that locks the integration recipe against drift
- [ ] Add `.orchestration/` for "sync engines to A1-Suite-Local-ANT/MAX consumers"

**Bottlenecks:**
- Both repos are **regulatory territory**: wrong rate → tax liability. Agents must be told to never guess, only port from primary source.
- These are **engines** — they feed 3+ downstream apps. Drift detection is critical.

---

### 1.4 `armosphera/A1-AI-Core` — shared `@a1/ai` provider core

**Pattern:** Framework-agnostic, dependency-injected. **Pinned commit `cec47006` is referenced by all 4 downstream consumers.**

**For AI coders:**
- This is the **most-coupled** repo — every change ripples to MAX, ANT, autoresearch-sboss
- `INTEGRATION.md` documents the DI contract (must stay stable)
- `KARPATHY_ROLLOUT.md` tracks which product uses which eval lane

**Production-readiness work:**
- [ ] Add `AGENTS.md`: "DI contract is frozen; new exports go in `experimental/` first; never break `createAi({...})` signature"
- [ ] Bump pinned commit → next minor (`f917e8a`); coordinate with all 4 consumers
- [ ] Add `program.md` for "add one more AI provider" (e.g. Anthropic native, Ollama local)
- [ ] Add Karpathy eval lane `di-contract-frozen` that fails if `createAi()` signature changes

**Bottlenecks:**
- High coupling — breaking the DI contract breaks MAX, ANT, autoresearch-sboss
- Bumping the pinned SHA requires synchronized PRs across 4 repos

---

### 1.5 `armosphera/A1-Suite-Local-ANT` — productionized A1 Suite

**Pattern:** Claude Code-native. Has `.claude/launch.json` (debugger config) + `.claude/settings.json` (SessionStart hook `reap-orphan-workers.sh`).

**For AI coders:**
- 30 phase tags, 25+ `.orchestration/` sub-plans
- `AGENTS.md` exists but is **minimal** (1 line: design reference)
- Sovereignty posture: `ARMOSPHERA_ONE_ALLOW_EGRESS=0`, deny-until-listed

**Production-readiness work:**
- [ ] Beef up `AGENTS.md`: TDD, 80% coverage, **sovereignty posture preservation**, no debug noise, single-host install path (`deploy/install.sh`) is the canonical deploy (Dockerfile is the second path)
- [ ] Document the relationship: **ANT = live, MAX = next-gen**. ANT freezes when MAX reaches parity.
- [ ] Add `program.md` for "add one more app" or "add one more fiscal engine integration"
- [ ] Wire `.claude/settings.json` to fire a smoke check on every SessionStart
- [ ] Coordinate `autoresearch-sboss` eval-lanes that lock sovereignty contracts (already partial: `egress-policy-contract`)

**Bottlenecks:**
- ANT is the **live** deploy — breaking changes risk customer data
- Many subsystems depend on each other (Fastify + SPA + DB + RBAC + Karpathy evals)

---

### 1.6 `armosphera/A1-Suite-Local-MAX` — next-gen Turbo monorepo

**Pattern:** 14 apps + 12 packages, Turbo + npm workspaces. v2.0.0 just released ("2-Day Sprint", 788 tests, 9/9 builds).

**For AI coders:**
- Has `.orchestration/phase9-rbac/` and `.orchestration/ai-erp-agentic-workflow/`
- No `AGENTS.md` at root — should have one
- `engines: node ^20.19.0 || ^22.13.0 || >=24`
- Pinned `next@16.3.0-canary.53` because of a known audit issue — flagged in CI

**Production-readiness work:**
- [ ] Add `AGENTS.md`: TDD, 80% coverage, **monorepo discipline** (one app per workspace, no cross-app imports except through `@a1/*` packages), Next 16 canary pin rationale, TypeScript strict
- [ ] Add `program.md` for "add one more app on `@a1/shell`"
- [ ] Add Karpathy eval lane `monorepo-parity-ant-max` to lock the migration target
- [ ] Add `.orchestration/wave-N-new-app/` template (mirror sovereign's pattern, but per-app)
- [ ] Wire `npm run verify` (audit + typecheck + lint + test + build + e2e + integrations) as the single gate

**Bottlenecks:**
- 14 apps × 12 packages = 168 cells in the cross-product. AI agents will struggle without explicit per-app scope.
- Next 16 canary pin — agents may "fix" the audit warning by bumping Next and breaking things

---

### 1.7 `armosphera/A1-AI-ERP-SBOS-MSTUDIO-sovereign` — air-gapped SBOSS

**Pattern:** **Most mature swarm framework in the portfolio.** 11 services, 7 plans × ~5 workers each = ~35 worktrees, TDD enforced, 80% coverage floor, `.w*-done` barriers.

**For AI coders:**
- `CLAUDE.md` referenced in scripts but not at root — should consolidate
- `.orchestration/sboss-plan{N}/w{N}-{name}/{task,status,handoff}.md` is the **production AI-coder workflow**
- `docs/superpowers/specs/`, `docs/superpowers/plans/`, `docs/superpowers/W0-DECISIONS.md`, `docs/superpowers/CONTRACTS.md` — formal spec layer
- `scripts/deploy.sh` is operator-facing, `scripts/deploy-smoke.sh` is the gate
- Sovereignty: `ALLOW_EGRESS=0` default, KMS rotation, Merkle audit, GDPR Art.5/15/17

**Production-readiness work:**
- [ ] Add `AGENTS.md` (root) that consolidates the swarm conventions into a single file agents read first
- [ ] Promote wave-sentinel files (`.w1-done`, etc.) to **git tags** so consumers can pin to a completed wave
- [ ] Add `scripts/spawn-worker.sh` that wraps `orchestrate-worktrees.cjs` + sets up Karpathy eval lane for the worker
- [ ] Wire a nightly cron that runs 1 wave unattended and opens a PR with retro
- [ ] Document the "Plan N" planning convention: `docs/superpowers/plans/N-name.md` is the plan, `.orchestration/sboss-planN/` is the execution
- [ ] Add `program.md` for "execute Plan N" (bootstraps the worker spawner)

**Bottlenecks:**
- 11 services, each with its own pyproject + tests — agents need a per-service manifest
- Air-gapped posture means no live API calls during dev — agents must use the deterministic mock LLM
- KMS / GDPR / Merkle audit — agents must never edit these without a spec

---

### 1.8 `armosphera/SBOS-A1-ERP` — open-core public surface

**Pattern:** **Gold standard for AGENTS.md.** 13 explicit rules + DMUX_WORKFLOWS.md + orchestration scripts. Wave-driven development.

**For AI coders:**
- `AGENTS.md` is the most thorough — copy this template to other repos
- `DMUX_WORKFLOWS.md` + `scripts/orchestrate-worktrees.cjs` — re-implementation of dmux for parallel workers
- `docs/AGENT_BRIEF.md` + `docs/HANDOFF-SUMMARY.md` + `docs/WAVE-N-SUMMARY.md` — formal wave reports
- `docs/PROJECT_STATUS.md` — live project state
- Porting convention: search `~/dev/A1-ERP-HY/` first, port not invent
- 80% coverage floor per module
- 11GB-swap-on-16GB-Mac fix: always run `node --test --test-concurrency=4 --test-timeout=60000`

**Production-readiness work:**
- [ ] After Wave 0 (RBAC) lands, cut v0.2.0 with all 9 domains in progress
- [ ] Migrate more domains from `A1-ERP-HY` (51+ hardening slices, 800+ tests)
- [ ] Document the porting protocol in `docs/SBOS_VS_A1_ERP_HY.md` (already exists, keep it current)
- [ ] Wire nightly e2e (like ANT has) — currently only `ci.yml`

**Bottlenecks:**
- RBAC is the slowest domain — agents should focus on the easier ones first to build momentum
- Open-core boundary is enforced by `npm run boundary-check` — agents must understand the rule

---

### 1.9 `armosphera/A1-portfolio` — meta-docs

**Pattern:** Cross-repo documentation. LICENSING.md, ARCHITECTURE.md, SECURITY.md.

**For AI coders:**
- This repo **is the documentation** — AI coders should read it before touching any other repo
- No code, no tests, no CI
- Owner: `ops@a1-suite.local`

**Production-readiness work:**
- [ ] Add `AGENTS.md`: "When in doubt, update this repo's ARCHITECTURE.md and the affected repo's README"
- [ ] Add `docs/CONTRIBUTING.md` — how to file issues against the right repo
- [ ] Add `docs/RELEASE-PROCESS.md` — how releases are cut (which tag, which notes)
- [ ] Add `docs/PRODUCTS.md` — naming matrix: "Which repo is canonical for X?" (closes the strategic #8 from v2-report)

**Bottlenecks:**
- Drift between `A1-portfolio/LICENSING.md` and per-repo LICENSE files (already known)
- 2026 H2 roadmap: AGPL-3.0 migration for engines — needs a working group

---

## 2. Cross-repo invariants — what every AI coder MUST preserve

These are **portfolio-level invariants** that span all 9 repos. Any agent that breaks one breaks the system.

1. **`@a1/ai` DI contract** (frozen at `cec47006` / `f917e8a1`):
   - `createAi({ safeFetch, isEgressAllowed, resolveDataDir, modelKeys, defaultModels, openrouter })` — signature is public API
   - 4 downstream consumers pin to a specific SHA: MAX, ANT, autoresearch-sboss, A1-portfolio (docs reference)
   - **Never edit `createAi()` without bumping major + coordinating 4 PRs**

2. **Sovereignty posture**:
   - Outbound network OFF by default across all repos
   - Egress deny-until-listed
   - Loopback always allowed
   - Each app has its own env-var for `*_ALLOW_EGRESS` — names vary (`ARMOSPHERA_ONE_ALLOW_EGRESS`, `A1_REQUIRE_PARTNER_INTEGRATIONS`, etc.)

3. **Source-available + vendor-by-copy**:
   - `A1-Localization-{AM,RU}` are NOT on npm
   - Consumers vendor them under `vendor/a1-localization-{am,ru}/`
   - `INTEGRATION.md` documents the recipe — fix upstream, re-vendor, never edit vendored copy
   - The exception: `autoresearch-sboss` is MIT and the original source of validators

4. **TDD + 80% coverage floor**:
   - SBOS-A1-ERP and sovereign enforce this in AGENTS.md
   - Engines (`A1-Localization-*`) don't have AGENTS.md — should adopt
   - Coverage is measured per touched module, not repo-wide

5. **Licensing**:
   - Engines + apps + A1-AI-Core: proprietary (`LicenseRef-Armosphera-Proprietary`)
   - `autoresearch-sboss`: MIT (only MIT-licensed repo)
   - 2026 H2 roadmap: engines → AGPL-3.0 (commercial relicense)
   - **Never change a LICENSE file without updating `A1-portfolio/LICENSING.md`**

6. **Git-pinned cross-repo deps**:
   - `@a1/ai` → `armosphera/A1-AI-Core.git@<sha>` (used in MAX, ANT, autoresearch-sboss)
   - Bumping the SHA requires updating all 3 downstream consumers in lockstep

7. **Karpathy eval lanes** (`scripts/karpathy-eval.mjs`):
   - Frozen contracts: `egress-policy-contract`, `invoice-extractor-contract`
   - These lock sovereignty + business semantics
   - Adding a new eval lane = adding a new product-research assertion

---

## 3. Common AI-coder task patterns (reusable recipes)

### Pattern A — "Add one validator / fiscal engine"

Used for: A1-Localization-AM, A1-Localization-RU, A1-Validator, autoresearch-sboss

```
1. Read AGENTS.md (or program.md for autoresearch-sboss)
2. Read the sibling validator in src/ to understand the contract
3. Write the test FIRST (RED): tests/<name>.test.js with real fixtures
4. Run npm test — confirm it fails for the right reason
5. Write minimum impl (GREEN): src/<name>.js exporting { validate, ... }
6. Re-export from index.js
7. Run npm test — confirm green
8. Update README.md module table
9. Update SOURCES.md if it cites a regulatory source
10. Commit with conventional prefix: feat(<area>): add <name>
```

### Pattern B — "Execute Plan N" (sovereign swarm pattern)

Used for: sovereign, ANT, MAX, SBOS

```
1. Read AGENTS.md + the plan: docs/superpowers/plans/N-name.md
2. Read the orchestration: .orchestration/sboss-planN/w{N}-{name}/task.md
3. Note barriers: which .w*-done files must exist before starting
4. Create worktree: git worktree add ../<repo>-w{N}-{name} -b orch-<...>
5. TDD: write test (RED) → impl (GREEN) → refactor (IMPROVE)
6. Touch .w{N}-done with summary
7. Write handoff.md with results
8. Update status.md
9. Push branch, open PR
10. Coordinate with sibling workers via the handoff chain
```

### Pattern C — "Run Karpathy eval loop overnight"

Used for: autoresearch-sboss (native), or any repo with `scripts/karpathy-eval.mjs`

```
1. Read program.md (or write one if absent)
2. Set LLM_ENDPOINT_URL, LLM_API_KEY, LLM_MODEL (or use mock)
3. Launch: claude-code --dangerously-skip-permissions -c "Have a look at program.md and let's kick off a new experiment"
4. Agent loops: edit → eval → keep/revert → log → repeat
5. After N hours: review results.tsv
6. PR the deltas
```

### Pattern D — "Bump pinned `@a1/ai` version"

Used for: MAX, ANT, autoresearch-sboss, A1-portfolio (docs)

```
1. Cut A1-AI-Core release v0.2.0
2. Note the SHA
3. PR #1: MAX package.json → bump @a1/ai to new SHA, run npm install, run verify
4. PR #2: ANT package.json → bump, run npm install, run e2e
5. PR #3: autoresearch-sboss program.md → bump if referenced
6. PR #4: A1-portfolio ARCHITECTURE.md → update pinned commit ref
7. Land all 4 in order: AI-Core first, then consumers, then docs
```

---

## 4. The plan — 3 waves, ~1 sprint each

### Wave 1 — Onboard every repo to the AGENTS.md pattern (1 sprint)

Goal: Every repo has an `AGENTS.md` that any AI coder (Claude Code / Codex / MiniMax) can read first and know the rules.

| Task | Repo | Effort | Output |
|---|---|---|---|
| Add `AGENTS.md` to A1-Validator | A1-Validator | 1 PR | 13-rule template (copy from SBOS, adapt) |
| Add `AGENTS.md` to A1-Localization-AM | A1-Localization-AM | 1 PR | Same |
| Add `AGENTS.md` to A1-Localization-RU | A1-Localization-RU | 1 PR | Same |
| Add `AGENTS.md` to A1-AI-Core | A1-AI-Core | 1 PR | + "DI contract frozen" rule |
| Add `AGENTS.md` to A1-portfolio | A1-portfolio | 1 PR | "This is docs" specialization |
| Add `AGENTS.md` to A1-Suite-Local-MAX | A1-Suite-Local-MAX | 1 PR | + monorepo discipline rules |
| Beef up `AGENTS.md` in A1-Suite-Local-ANT | A1-Suite-Local-ANT | 1 PR | Currently 1 line, expand to ~30 |
| Consolidate `CLAUDE.md` + swarm rules into root `AGENTS.md` of sovereign | A1-AI-ERP-SBOS-MSTUDIO-sovereign | 1 PR | Pull from `.orchestration/sboss-planN/w{N}/task.md` patterns |

**Total: 8 PRs, ~1 sprint with 2-3 parallel AI coders.**

### Wave 2 — Stand up the orchestration scaffolding in every repo (1 sprint)

Goal: Every repo has `.orchestration/` + `scripts/orchestrate-worktrees.cjs` (or equivalent) so AI coders can be spawned in parallel.

| Task | Repo | Effort | Output |
|---|---|---|---|
| Add `.orchestration/wave-N-{name}/` template + `scripts/spawn-worker.sh` to A1-Validator | A1-Validator | 1 PR | Mirror sovereign's pattern |
| Add `.orchestration/` to A1-Localization-AM | A1-Localization-AM | 1 PR | Pattern from SBOS |
| Add `.orchestration/` to A1-Localization-RU | A1-Localization-RU | 1 PR | Pattern from SBOS |
| Promote wave-sentinel files (`.w1-done` etc.) to git tags in sovereign | A1-AI-ERP-SBOS-MSTUDIO-sovereign | 1 PR | Cleanup, version discipline |
| Add Karpathy eval lane `di-contract-frozen` to A1-AI-Core | A1-AI-Core | 1 PR | Lock createAi() signature |
| Add Karpathy eval lane `vendor-smoke-contract` to both localization repos | A1-Localization-{AM,RU} | 2 PRs | Lock vendor recipe |
| Add `program.md` to A1-Validator and A1-Localization-{AM,RU} | 3 repos | 3 PRs | Karpathy-style charters |

**Total: 9 PRs, ~1 sprint with 2-3 parallel AI coders.**

### Wave 3 — First overnight Karpathy eval runs (1 sprint)

Goal: Demonstrate the workflow end-to-end on every repo.

| Task | Repo | Effort | Output |
|---|---|---|---|
| Run autoresearch-sboss eval loop overnight | autoresearch-sboss | 0 (script) | 500 experiments, results.tsv deltas, optional PR |
| Run sovereign Plan 6 (observability) | sovereign | 1 PR (spawn plan) | Wave delivered |
| Run SBOS Wave 1 (RBAC port) | SBOS-A1-ERP | 1 PR (spawn plan) | RBAC foundation shipped |
| Run MAX phase 10 (cockpit agents) | A1-Suite-Local-MAX | 1 PR (spawn plan) | New app shipped |
| Run ANT phase 10.10 (CI smoke full split) | A1-Suite-Local-ANT | 1 PR (spawn plan) | Already in `.orchestration/` — just execute |
| Cut A1-AI-Core v0.2.0 + bump consumers | A1-AI-Core + 3 consumers | 4 PRs | Coordinated SHA bump |

**Total: ~10 PRs, ~1 sprint with the full fleet.**

---

## 5. Cross-repo dependency graph

```
Foundation (engines, MIT + proprietary):
  autoresearch-sboss (MIT) ──port──> A1-Validator (Python)
                            ──provides example workflows──>
  A1-Localization-AM (JS)  ──vendored by──> ANT, MAX, SBOS, sovereign
  A1-Localization-RU (JS)  ──vendored by──> ANT, MAX
  A1-AI-Core (@a1/ai)      ──pinned SHA──> ANT, MAX, autoresearch-sboss

Applications (consume engines):
  A1-Suite-Local-ANT     (productionized, live)
  A1-Suite-Local-MAX     (next-gen monorepo)
  A1-AI-ERP-SBOS-MSTUDIO-sovereign (air-gapped SBOSS)
  SBOS-A1-ERP            (open-core dist of A1-ERP-HY)

Meta:
  A1-portfolio           (cross-repo docs)
```

**Implication for AI coders:** Changes to foundation repos ripple outward. A change to `autoresearch-sboss` → port to `A1-Validator`. A change to `A1-AI-Core` → bump 3 consumers. A change to either localization → re-vendor in 3-4 apps.

---

## 6. Bottlenecks for AI coders (and mitigations)

| Bottleneck | Mitigation |
|---|---|
| No AGENTS.md in 6 of 9 repos | Wave 1 — copy SBOS template |
| Vendored code looks editable | Explicit "DO NOT EDIT `_vendored/`" rule in AGENTS.md |
| Fiscal engines are regulatory territory | "Never guess, cite primary source" rule in AGENTS.md |
| `@a1/ai` SHA bumps ripple | Pattern D recipe above |
| Sovereign swarm has many moving parts | Single root `AGENTS.md` consolidates conventions |
| Cross-repo docs drift | `A1-portfolio` is the source-of-truth; add drift-check eval lane |
| 80% coverage floor — agents skip it | Pre-commit hook + CI gate |
| `node --test --test-timeout` is Node 20+ only | AGENTS.md notes the version requirement |
| ANT is **live** — risk of breaking customer data | Sovereignty contracts locked via Karpathy eval lanes |
| `next@16.3.0-canary.53` is pinned for a known reason | AGENTS.md explains the canary rationale |

---

## 7. Quick wins (safe for AI coders, no risk)

1. **Add `AGENTS.md` everywhere** — copy from SBOS template, adapt per repo
2. **Add `program.md` everywhere** — Karpathy-style charter, 30-50 lines, can be minimal
3. **Cut GitHub Releases for repos that don't have them** — done in this session, all 9 done
4. **Wire Dependabot** — already done in this session
5. **Add `.dockerignore`** — already done for ANT
6. **Document the swarm pattern in A1-portfolio** — `docs/CONTRIBUTING.md`
7. **Lock contracts via Karpathy eval lanes** — `di-contract-frozen`, `vendor-smoke-contract`, `egress-policy-contract`

## 8. Hard problems (need human-in-the-loop)

1. **PyPI trusted-publisher migration** — needs 2FA browser step (`A1-Validator`)
2. **Multi-arch Docker (amd64 + arm64)** — blocked on upstream docker/buildx bug
3. **License matrix decision** — proprietary vs AGPL-3.0 vs MIT migration (2026 H2)
4. **ANT ↔ MAX consolidation** — which is canonical, when does ANT freeze?
5. **A1-ERP-HY → SBOS-A1-ERP porting** — 51+ hardening slices, 800+ tests, brand-strip
6. **Sovereign KMS production-side** — AwsKmsSigner / GcpKmsSigner stubs need real keys
7. **`@a1/ai` v0.2.0 cut** — needs coordinated SHA bump across 3 consumers
8. **Cross-repo drift detection** — needs a CI lane that diffs against A1-portfolio

---

## 9. Tools and integration points

### Reusable scripts (already exist somewhere — copy to other repos)

- `armosphera/SBOS-A1-ERP/scripts/orchestrate-worktrees.cjs` — worktree + tmux per worker
- `armosphera/SBOS-A1-ERP/scripts/tmux-worktree-orchestrator.cjs` — shared helper
- `armosphera/SBOS-A1-ERP/scripts/check-open-core-boundary-contract.mjs` — boundary guard
- `armosphera/SBOS-A1-ERP/scripts/lint-baseline.mjs` — evolving "allowed failures" list
- `armosphera/autoresearch-sboss/scripts/karpathy-eval.mjs` — eval lane runner
- `armosphera/autoresearch-sboss/program.md` — eval-loop charter template

### Hooks (Claude Code)

- `armosphera/A1-Suite-Local-ANT/.claude/launch.json` — debugger config (start node with sovereign env)
- `armosphera/A1-Suite-Local-ANT/.claude/settings.json` — SessionStart hook (reap orphan workers)

### CI gates (target for every repo)

```
npm run verify  →  audit → typecheck → lint → test → build → test:e2e → test:integrations → docker:build
```

This is the chain in `A1-Suite-Local-MAX/package.json`. Replicate.

---

## 10. Day-one instructions for any AI coder

When you (a fresh AI coder — Claude Code, Codex, MiniMax, Mavis, Hermes) land on a new A1 repo:

```
1. cd <repo>
2. cat AGENTS.md          # if missing: STOP, file an issue, ask the operator
3. cat README.md          # install + quick start
4. cat .orchestration/    # if present: read the latest plan
5. cat program.md         # if present: this is your charter
6. ls deploy/             # if present: that's the canonical deploy path
7. cat package.json | jq '.scripts'   # find the `verify` / `check` script
8. npm run verify         # confirm you can pass the gate BEFORE editing
9. Now you can edit
```

If step 2 (`AGENTS.md`) is missing → file an issue, do **not** improvise. The whole point of this plan is to make every repo have one.

---

## 11. Metric for "done"

This plan is complete when:

- [ ] All 9 repos have `AGENTS.md` (Wave 1)
- [ ] All 9 repos have `program.md` or equivalent agent charter (Wave 2)
- [ ] All 9 repos have `.orchestration/` + at least one wave plan (Wave 2)
- [ ] All 9 repos have a Karpathy eval lane that locks a critical contract (Wave 2)
- [ ] All 9 repos have CI that runs `verify` on every PR (Wave 1)
- [ ] At least 1 overnight Karpathy eval run has produced PR-able results in each repo (Wave 3)
- [ ] A1-portfolio has `docs/CONTRIBUTING.md`, `docs/RELEASE-PROCESS.md`, `docs/PRODUCTS.md`

Estimated total: **~3 sprints, ~30 PRs, with 2-3 parallel AI coders + 1 human operator for the gate decisions.**

---

*End of plan. Sources: `gh` API against `github.com/armosphera`. Subagent deep-research timed out at 10min; this plan is built on primary investigation + 6+ targeted API calls that captured the load-bearing facts (AGENTS.md, DMUX_WORKFLOWS.md, .orchestration/ tree, program.md, .claude/ configs, sovereign swarm handoffs).*