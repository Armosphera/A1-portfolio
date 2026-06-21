# program.md — keep A1-portfolio docs in sync with reality

You are a documentation-synchronization agent. Your job: **detect and fix drift
between the `A1-portfolio` documentation and the actual state of the 9 A1 repos.**

This repo is **meta-docs**. It has no code, no tests, no CI. Your job is to make
the 4 load-bearing docs (`README.md`, `LICENSING.md`, `ARCHITECTURE.md`,
`SECURITY.md`) accurately describe what's in the org.

## The task

Given a drift signal (e.g. "new repo added to armosphera org", "license changed in
a repo", "new sovereign invariant introduced"), update the affected docs in this
repo to match reality.

## The loop

```
1. Read AGENTS.md (rules) + this file (loop)
2. Pick the next drift task from .orchestration/doc-drift-tasks.md
3. Fetch ground truth via gh API:
     - Repo list: gh repo list armosphera --json name,visibility,description,...
     - LICENSE per repo: gh api repos/armosphera/<repo>/license --jq '.spdx_id'
     - Latest tag: gh api repos/armosphera/<repo>/tags --jq '.[0].name'
     - Latest release: gh api repos/armosphera/<repo>/releases --jq '.[0]'
4. Compare against the current docs
5. Edit README.md / LICENSING.md / ARCHITECTURE.md / SECURITY.md to match
6. Add CONTRIBUTING.md / RELEASE-PROCESS.md / PRODUCTS.md if missing (per AGENTS.md)
7. Commit with conventional docs prefix
8. Mark .orchestration/<task>-done
```

## Files you'll touch

| File | Why |
|---|---|
| `README.md` | Repo index — must list every active repo |
| `LICENSING.md` | License matrix — must match each repo's LICENSE file |
| `ARCHITECTURE.md` | Layer cake — must show actual repo layering |
| `SECURITY.md` | Supported versions table — must match actual release tags |
| `docs/CONTRIBUTING.md` | (TODO — file doesn't exist yet) |
| `docs/RELEASE-PROCESS.md` | (TODO) |
| `docs/PRODUCTS.md` | (TODO — naming matrix) |

## Files you must NOT touch

- You may not create code, tests, or CI in this repo. AGENTS.md §1 says: **"This repo
  has no code, no tests, no CI. Don't add any."**
- You may not introduce any secrets, customer data, or API keys. Drift-detect and
  reject.

## Rules of engagement

- **4 files must stay coherent.** If you add a repo, edit all 4. If you deprecate a
  repo, edit all 4 + open an issue.
- **Use `gh` API for ground truth.** Never guess what's in another repo — fetch it.
- **Cite the API call in the commit body** so reviewers can verify the source.
- **Markdown discipline** (per AGENTS.md §6): one H1 per file, code blocks must
  specify language, tables GFM-aligned.

## Drift detection — manual + scripted

This repo's drift CI lane (`portfolio-drift-contract`) is **TODO**. Until it lands,
the manual drift checks are:

```bash
# Repo index drift
gh repo list armosphera --no-archived --json name,visibility \
  --jq '.[].name' | sort > /tmp/actual-repos.txt
grep -oE 'Armosphera/[^)]*\)' README.md | sed 's/Armosphera\///;s/)$//' \
  | sort > /tmp/docs-repos.txt
diff /tmp/actual-repos.txt /tmp/docs-repos.txt

# License drift
for r in $(cat /tmp/actual-repos.txt); do
  lic=$(gh api repos/armosphera/$r/license --jq '.spdx_id // "NOASSERTION"')
  echo "$r $lic"
done

# Layer cake drift (manual — read ARCHITECTURE.md, compare to actual primary languages)
gh repo list armosphera --no-archived --json name,primaryLanguage \
  --jq '.[] | "\(.name) \(.primaryLanguage.name)"'
```

A Karpathy eval lane `portfolio-drift-contract` should be added to encode this
scripted check (see `.orchestration/doc-drift-tasks.md`).

## Environment

- No build, no tests.
- `gh` CLI authenticated against the armosphera org (admin or write on this repo).
- Markdown editor.

## When to stop

- **All drift tasks complete.** `.orchestration/<task>-done` for every item in
  `.orchestration/doc-drift-tasks.md`.
- **A repo's state is genuinely ambiguous** (e.g. "is WIP active or deprecated?"):
  file an issue against `armosphera/A1-portfolio` asking the operator. Do not
  silently delete the entry.

## Logging

Use conventional commits with `docs(<scope>): ...` prefix:
- `docs(readme): add A1-AI-ERP-SBOS-MSTUDIO-sovereign to repo index`
- `docs(licensing): correct A1-Validator license per actual LICENSE file`
- `docs(arch): refresh layer cake with A1-portfolio as meta layer`

## Coordination

- This repo is **read by every agent** before touching any other A1 repo. Drift
  here = drift everywhere.
- Major changes (e.g. AGPL-3.0 migration roadmap) need an ADR before they land
  in `LICENSING.md`. Open a discussion issue first.

---

*Companion to `AGENTS.md`. AGENTS.md = rules (this repo IS the docs). This file =
day-to-day drift-detection loop.*