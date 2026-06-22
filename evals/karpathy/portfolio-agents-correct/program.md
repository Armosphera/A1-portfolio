# portfolio-agents-correct

Cross-repo Karpathy lane. Detects when an engine/app repo's AGENTS.md
is identical to A1-portfolio/AGENTS.md (the cross-repo documentation
charter). This pattern indicates a regression where the operator
copy-pasted the wrong file over a repo-specific AGENTS.md.

## Why this matters

The A1-portfolio/AGENTS.md is the **cross-repo documentation charter**
that covers:
- `LICENSING.md` — license matrix
- `ARCHITECTURE.md` — layer cake
- `SECURITY.md` — vulnerability reporting

This file is correct ONLY for A1-portfolio itself. Every other repo
must have a **repo-specific** AGENTS.md that documents:
- the repo's layer (Engine / Application / Reference)
- the repo's contract surface (public API, DI contracts, etc.)
- the repo's local conventions (TDD rules, sovereignty posture, etc.)

If an engine/app AGENTS.md is identical to A1-portfolio's, the
repo's specific rules (TDD, contract invariants, sovereignty posture)
have been **silently lost** — a critical regression.

## What's frozen

1. **A1-portfolio's AGENTS.md is the unique source** — identical elsewhere is a regression.
2. **All Engine/Application repos** must have a repo-specific AGENTS.md.
3. **Reference repos (autoresearch-sboss)** must have a repo-specific AGENTS.md.
4. **Mirror repos** (A1-Platform-MAX, A1-SMB-*) are exempt — they're
   read-only clones, no charter expected.

## Known regressions detected (2026-06-22)

The lane was created **after** 3 such regressions were already fixed:

| Repo | Regression commit | Restored in | Original commit |
|------|-------------------|--------------|------------------|
| A1-AI-Core | `8560169` | `f5084f5` | `c81948d` |
| A1-AI-ERP-SBOS-MSTUDIO-sovereign | `c586377` | `be5c146` | `669c714` |
| autoresearch-sboss | `3c1e6e4` | `4b38f5a` | `1ae026e` |

When this lane first ran, it found **7 more regressions** to fix:
- A1-Localization-AM, A1-Localization-RU, A1-Validator (Engine)
- A1-Suite-Local-ANT, SBOS-A1-ERP (Application)
- a1-cross-link-sweep (Tooling)
- A1-Suite-Local-MAX (Application, missing)

## Allowed changes

- Adding new repos to `expected-repos.json` (will be auto-checked)
- Fixing a regression (restoring the repo-specific AGENTS.md)
- Removing a mirror repo (deletes it from the check)

## Disallowed changes

- Making an engine/app AGENTS.md identical to A1-portfolio's (regression)
- Removing AGENTS.md from an engine/app repo (loses the charter)
- Skipping the check by deleting this file (no — this lane is critical)

## Run

```bash
node evals/karpathy/portfolio-agents-correct/check.js
```

## Source

- `expected-repos.json` — canonical repo list (15 repos)
- `~/dev/armosphera/src/<repo>/AGENTS.md` — each repo's charter
- `~/dev/armosphera/src/A1-portfolio/AGENTS.md` — the source

## Why this lane is cross-repo

This is the **first cross-repo Karpathy lane** in the portfolio:
- It runs in A1-portfolio (the registry/docs repo)
- It checks AGENTS.md of **every other repo** in the portfolio
- The check is "diff" — not "format match" — so additions to A1-portfolio's
  AGENTS.md don't trigger false positives (as long as other repos
  remain different)

## Future work

- A per-engine Karpathy lane could check specific contract surfaces
  (e.g. ANT's `egress-policy-contract` already does this for sovereignty)
- A per-application Karpathy lane could check TDD rules (e.g. ANT's
  `coverage-baseline.json`)

But this lane is the **entry point** — if AGENTS.md is wrong, nothing
else in the repo is safe.