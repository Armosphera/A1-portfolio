# Contributing to the A1 Portfolio

**Effective:** 2026-06-21
**Owner:** Armosphera LLC
**Contact:** ops@a1-suite.local

This document covers **cross-repo contributions** — issues, PRs, and questions that span
multiple A1 repos. For repo-specific conventions, read that repo's `AGENTS.md` first.

## TL;DR

1. **Pick the right repo** for your issue. See [PRODUCTS.md](./PRODUCTS.md).
2. **Read the repo's `AGENTS.md`** before opening a PR. It has repo-specific rules.
3. **Open the issue in the repo, not in `A1-portfolio`** (unless it's a cross-repo doc/meta issue).
4. **Reference the source** for any fiscal / regulatory / sovereignty change.

## Repo index (where to file what)

| You want to... | File in... | Why |
|---|---|---|
| Add a new fiscal engine (Armenian) | [`A1-Localization-AM`](../A1-Localization-AM) | Engine source-of-truth |
| Add a new fiscal engine (Russian) | [`A1-Localization-RU`](../A1-Localization-RU) | Engine source-of-truth |
| Port a SBOSS validator into A1-Validator | [`A1-Validator`](../A1-Validator) | Validator source-of-truth |
| Add a new AI provider / capability | [`A1-AI-Core`](../A1-AI-Core) | `@a1/ai` source-of-truth (DI-contract-frozen) |
| Add a new app to the suite (monorepo) | [`A1-Suite-Local-MAX`](../A1-Suite-Local-MAX) | Turbo monorepo, next-gen |
| Patch the live deploy | [`A1-Suite-Local-ANT`](../A1-Suite-Local-ANT) | Productionized app shell |
| Execute a sovereign plan / swarm worker | [`A1-AI-ERP-SBOS-MSTUDIO-sovereign`](../A1-AI-ERP-SBOS-MSTUDIO-sovereign) | Air-gapped SBOSS |
| Run a Karpathy eval loop overnight | [`autoresearch-sboss`](../autoresearch-sboss) | Eval-loop harness |
| Update cross-repo docs / conventions | [`A1-portfolio`](../A1-portfolio) | **Only this repo** for meta-docs |
| Report a security vulnerability | See [SECURITY.md](../SECURITY.md) | All repos share one policy |

## How to file an issue

### Good issue template

```markdown
## Context
<What is this about? 1-2 sentences.>

## Goal
<What does "done" look like?>

## Acceptance criteria
- [ ] criterion 1
- [ ] criterion 2

## Out of scope
- <What this issue explicitly does NOT cover>

## References
- AGENTS.md section: <link>
- program.md charter: <link>
- Roadmap row: <link>
- Primary source (if fiscal): <link>

## Estimated effort
<e.g. ~2-3 hours>
```

### Bad issue red flags

- ❌ "Make X better" without measurable acceptance criteria
- ❌ Filing in `A1-portfolio` when the change belongs in a specific repo
- ❌ Cross-repo refactor without a coordination plan (open a discussion first)
- ❌ Fiscal / regulatory change without a primary-source citation
- ❌ Sovereignty contract change without the matching Karpathy eval lane

## How to open a PR

1. **Branch name** — `orch/<plan>-<worker>` for swarm workers, `feat/<scope>` for
   solo work, `fix/<scope>` for patches. Match the repo's convention.
2. **Commit prefix** — conventional commits per the repo's `AGENTS.md`. Most use
   `<type>(<scope>): <subject>`.
3. **Tests** — red → green → improve. Coverage ≥80% per touched module.
4. **Self-review** — run the repo's gate (`npm run verify`, `pytest --cov`,
   `npm test`) before opening.
5. **PR body** — reference the issue, cite primary sources if fiscal, note
   cross-repo impact if any.

## Cross-repo coordination

Some changes ripple. Before opening a PR that touches:

- **`@a1/ai` DI contract** (any change to `createAi()`) → open coordinated PRs in
  this order:
  1. `A1-AI-Core` (the source)
  2. `A1-Suite-Local-MAX` (bump SHA, run `npm run verify`)
  3. `A1-Suite-Local-ANT` (bump SHA, run e2e)
  4. `autoresearch-sboss` (verify `karpathy-eval.mjs` still loads)
  5. `A1-portfolio` (update pinned SHA in `ARCHITECTURE.md`)

- **Vendor location change** in `A1-Localization-{AM,RU}` → notify all consumers:
  `A1-Suite-Local-ANT`, `A1-Suite-Local-MAX`, `A1-AI-ERP-SBOS-MSTUDIO-sovereign`,
  `SBOS-A1-ERP`. Each must re-vendor.

- **Sovereignty contract** (egress, RBAC, audit chain) → update the matching Karpathy
  eval lane in `evals/karpathy/` in the **same PR**. Never break a sovereignty contract
  silently.

## What NOT to file in A1-portfolio

`A1-portfolio` is **meta-docs** — repo index, licensing, architecture, security.
Do NOT file here:

- Code changes (file in the actual repo)
- Engine bugs (file in the engine repo)
- Sovereign swarm plans (file in sovereign)
- App features (file in MAX or ANT)

## License of contributions

By contributing, you agree your contribution is licensed under the same license
as the repo you're contributing to. See each repo's `LICENSE` file.

## Code of conduct

Be respectful. Be specific. Cite sources. Don't guess on regulatory code.
Don't break sovereignty contracts.

---

*Companion to `AGENTS.md`. `AGENTS.md` = portfolio-level rules. This file = how to
contribute. Companion docs: [PRODUCTS.md](./PRODUCTS.md) (naming matrix),
[RELEASE-PROCESS.md](./RELEASE-PROCESS.md) (release flow).*