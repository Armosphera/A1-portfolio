# Adding a New Repo to the A1 Portfolio

**Effective:** 2026-06-21
**Owner:** Armosphera LLC
**Status:** Recipe — run by the operator when adding a new repo.

This document captures the **end-to-end checklist** for adding a new repository
to the `armosphera/` org. It's the meta-recipe that ensures the new repo starts
its life with the same AI-coder scaffolding as the existing 9.

## TL;DR — the 9-step checklist

```
1. Plan the repo (layer, domain, consumers)
2. Create the repo with naming convention
3. Drop in the standard AI-coder scaffolding
4. Add SPDX + LICENSE
5. Add CI workflow + Dependabot
6. Register the repo in A1-portfolio
7. Update cross-repo docs (README, LICENSING, ARCHITECTURE, STATE, expected-repos.json)
8. Open a discussion issue (PR or wave plan)
9. Cut v0.1.0 release
```

## Step 1: Plan the repo

Before creating anything, answer:

| Question | Answer goes to |
|---|---|
| What layer? | Engine / Application / Reference / Meta / Tooling |
| What domain? | Specific business area (fiscal, AI, sovereignty, etc.) |
| Who consumes it? | List of repos that will import from / vendor from / pin to |
| What license? | MIT (rare), Proprietary (default), AGPL-3.0 + Commercial (planned H2) |
| Public or private? | Public = open-source, Private = internal/single-tenant |
| What does it do? | One-paragraph description (goes into GitHub "About") |

Use [`PRODUCTS.md`](./PRODUCTS.md) to verify the new repo isn't redundant with
existing ones. Open a discussion issue in `A1-portfolio` first if the layer
choice is unclear.

## Step 2: Create the repo with naming convention

Naming follows existing patterns:

| Pattern | Examples | Meaning |
|---|---|---|
| `A1-<Engine>-<Locale>` | `A1-Localization-AM`, `A1-Localization-RU` | Locale-specific fiscal engine |
| `A1-<Domain>` | `A1-Validator`, `A1-AI-Core` | Cross-cutting library |
| `A1-Suite-Local-<Variant>` | `A1-Suite-Local-MAX`, `A1-Suite-Local-ANT` | Suite deployment variants |
| `A1-AI-ERP-SBOS-MSTUDIO-<Posture>` | `A1-AI-ERP-SBOS-MSTUDIO-sovereign` | Sovereign platform with posture suffix |

Create via:

```bash
gh repo create armosphera/A1-<name> \
  --description "<one-paragraph from Step 1>" \
  --<visibility> \
  --add-readme
```

Then clone locally and `cd` into it.

## Step 3: Drop in the standard AI-coder scaffolding

Every A1 repo gets **5 standard files**:

| File | Source | Why |
|---|---|---|
| `AGENTS.md` | Copy from `armosphera/SBOS-A1-ERP/AGENTS.md` (gold standard, 13 rules) | Rules for AI coders |
| `program.md` | Write a Karpathy-style agent charter (50-100 lines) | Day-to-day agent loop |
| `.orchestration/<roadmap>.md` | Write a status checklist | Track progress |
| `.github/workflows/ci.yml` | Copy from `armosphera/A1-AI-Core/.github/workflows/ci.yml` | CI gate |
| `.github/dependabot.yml` | Copy from any existing A1 repo's version | Dependabot config |

### 3a. `AGENTS.md`

Copy from SBOS-A1-ERP and adapt the section titles:

```bash
curl -sL https://raw.githubusercontent.com/Armosphera/SBOS-A1-ERP/main/AGENTS.md \
  -o AGENTS.md
# Edit sections 1, 5, 9, 13 to match this repo's specifics
```

Required sections (don't drop any):

1. What this repo is + relationship to siblings
2. TDD + 80% coverage floor (where applicable)
3. The N files you must NOT edit (repo-specific)
4. Conventional commits + scope convention
5. No hardcoded secrets
6. Files / functions / nesting budget
7. Sovereignty posture (where applicable)
8. Karpathy eval lanes (where present)
9. Cross-repo coordination
10. Day-one checklist for AI agents

### 3b. `program.md`

Write a Karpathy-style charter. Template:

```markdown
# program.md — <agent charter>

You are an autonomous <agent>. Your job: <one-sentence>.

## The task

<What the agent is optimizing.>

## The loop

\`\`\`
1. Read AGENTS.md + this file
2. Read .orchestration/<roadmap>.md
3. <loop step 1>
4. <loop step 2>
5. ...
\`\`\`

## Files you'll touch

| File | Why |
|---|---|
| ... | ... |

## Files you must NOT touch

- ...

## Rules of engagement

- ...

## Environment

- ...

## When to stop

- ...
```

### 3c. `.orchestration/<roadmap>.md`

Write a status checklist:

```markdown
# <Roadmap Name>

Status checklist. \`[x]\` = shipped + tests green + ...

## <Phase 1>
- [ ] Item 1
- [ ] Item 2

## <Phase 2>
- [ ] Item 1

## Workflow

For each item:
\`\`\`
1. Read .orchestration/program.md
2. ...
\`\`\`
```

### 3d. `.github/workflows/ci.yml`

Copy and adapt from existing repo. Minimum:

```yaml
name: ci
on:
  push: { branches: [main] }
  pull_request: { branches: [main] }
  workflow_dispatch: {}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: npm install --no-audit --no-fund
      - run: npm test
```

Add Karpathy eval lane jobs as `check.js` scripts accumulate.

### 3e. `.github/dependabot.yml`

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule: { interval: "weekly", day: "monday", time: "06:00" }
    groups:
      production-dependencies:
        dependency-type: "production"
        patterns: ["*"]
      development-dependencies:
        dependency-type: "development"
        patterns: ["*"]
    commit-message:
      prefix: "deps"
      prefix-development: "deps(dev)"
      include: "scope"
```

(For Python repos: `package-ecosystem: "pip"`.)

## Step 4: Add SPDX + LICENSE

```bash
# SPDX header in every source file (Python):
# SPDX-License-Identifier: LicenseRef-Armosphera-Proprietary
# SPDX-FileCopyrightText: 2026 Armosphera LLC

# LICENSE file (copy from armosphera/A1-AI-Core/LICENSE — proprietary template)
```

See [`LICENSING.md`](../LICENSING.md) for the SPDX matrix.

## Step 5: Add CI workflow + Dependabot

Already covered in Step 3. Just verify both `.github/workflows/ci.yml`
and `.github/dependabot.yml` exist and are wired to the test runner.

## Step 6: Register the repo in A1-portfolio

Edit `armosphera/A1-portfolio/expected-repos.json` to add the new repo:

```json
{
  "name": "A1-<name>",
  "visibility": "public",
  "layer": "Engine",
  "license": "Proprietary",
  "spdx": "LicenseRef-Armosphera-Proprietary"
}
```

Also update `STATE.md` with the addition.

## Step 7: Update cross-repo docs

These 4 files in `armosphera/A1-portfolio` must stay in sync:

1. `README.md` — repo index table (add new repo with layer)
2. `LICENSING.md` — license matrix (add new row)
3. `ARCHITECTURE.md` — layer cake (add new layer if applicable)
4. `SECURITY.md` — supported versions table (add new repo when it ships a release)
5. `expected-repos.json` — canonical list (Step 6)
6. `STATE.md` — portfolio snapshot

The drift-check CI (`scripts/check-portfolio-drift.js`) will fail if you
forget any of these. Run it locally:

```bash
cd armosphera/A1-portfolio
node scripts/check-portfolio-drift.js
```

## Step 8: Open a discussion issue

Open a discussion issue in `armosphera/A1-portfolio` with:

- Why this repo is needed (vs. existing alternatives)
- Which 5 standard files will be added
- The naming convention + license chosen
- Consumer impact (which other repos will need updates)
- Rollback plan if the repo doesn't pan out

For complex new repos (a new app on MAX, a new sovereign service), this should
be a Discussion, not an Issue, and wait for operator approval before Step 2.

## Step 9: Cut v0.1.0 release

Once the repo has:

- The 5 standard files
- At least one passing CI run
- README.md + LICENSE + CHANGELOG.md (initial entries)

Cut v0.1.0:

```bash
gh release create v0.1.0 \
  --title "A1-<name> v0.1.0 — initial release" \
  --notes "First tagged release. <one-paragraph summary>." \
  --target main
```

Then re-run the `armosphera/A1-portfolio` drift-check to confirm the new
repo's release is recognized.

## What NOT to do

- ❌ Don't create the repo on a personal account first, then transfer. Create
  it directly on `armosphera/`.
- ❌ Don't skip the LICENSE file — even "internal" repos need a license.
- ❌ Don't add a CodeQL or other heavy workflow until the basics (test + lint)
  are green.
- ❌ Don't push to `main` directly for non-trivial changes — open a PR.

## Summary

A new repo lands with:

- 5 standard files (`AGENTS.md`, `program.md`, `.orchestration/<roadmap>.md`,
  `.github/workflows/ci.yml`, `.github/dependabot.yml`)
- A SPDX + LICENSE
- A passing CI run on `main`
- A v0.1.0 release
- A row in `A1-portfolio` (`README.md`, `LICENSING.md`, `ARCHITECTURE.md`,
  `SECURITY.md`, `expected-repos.json`, `STATE.md`)

All of this is enforceable via the `portfolio-drift` Karpathy eval lane in
`armosphera/A1-portfolio/.github/workflows/portfolio-drift.yml`.

---

*Companion to `CONTRIBUTING.md` + `PRODUCTS.md`. This file = "how to add a new
repo". `CONTRIBUTING.md` = "how to contribute to existing repos".*