# A1 Release Process

**Effective:** 2026-06-21
**Owner:** Armosphera LLC
**Contact:** ops@a1-suite.local

This document covers how releases are cut across the A1 portfolio. For repo-specific
release details, read that repo's `AGENTS.md` and `CHANGELOG.md` (when present).

## TL;DR

- **Source-available engines + apps** — releases are GitHub Releases (not PyPI/npm).
  Vendored by consumers.
- **MIT reference** (`autoresearch-sboss`) — releases are GitHub Releases + PyPI.
- **`@a1/ai` core** — releases are GitHub Releases. Consumers pin a SHA.
- **Sovereign SBOSS** — releases are GitHub Releases + a per-release
  `RELEASE-NOTES-v<X.Y.Z>.md` + `CHANGELOG.md` entry + Docker images.
- **Cross-cutting** — every release references the matching wave / sprint / issue.

## Versioning

All A1 repos use [Semantic Versioning](https://semver.org/):

- **MAJOR** — breaking changes (DI contract changes, schema migrations, license
  migrations). Requires coordinated cross-repo PRs.
- **MINOR** — additive features (new engine, new export, new app). New capabilities
  that don't break existing consumers.
- **PATCH** — bug fixes, doc updates, test additions.

## Release cadence

There is **no fixed release cadence**. Releases are cut when:

- A meaningful slice is done (wave / sprint / epic)
- A breaking change is queued
- A security fix needs to ship
- Operator requests a release for a customer

## Pre-release checklist

Before cutting a release:

- [ ] All `Wanted` issues for the slice are closed
- [ ] CI is green on `main`
- [ ] `CHANGELOG.md` (when present) is updated
- [ ] All cross-repo coordination PRs are landed
- [ ] Sovereignty contracts (egress, RBAC, audit chain) are still green via Karpathy
      eval lanes
- [ ] Coverage ≥80% per touched module
- [ ] Tag is created on the commit that should be released

## How to cut a release

### Step 1: Pick the version

- Look at the commits since the last tag.
- Decide MAJOR / MINOR / PATCH based on the rules above.
- For `A1-AI-Core`, **breaking the DI contract requires a MAJOR bump** AND a
  coordinated 4-repo SHA bump.

### Step 2: Update CHANGELOG.md

If the repo has a `CHANGELOG.md` (Keep-a-Changelog format):

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- ...

### Changed
- ...

### Fixed
- ...

### Removed
- ...
```

### Step 3: Bump the version

For Python (`pyproject.toml`):

```toml
[project]
version = "X.Y.Z"
```

For Node (`package.json`):

```json
{
  "name": "...",
  "version": "X.Y.Z"
}
```

### Step 4: Commit the version bump

```bash
git checkout -b release/vX.Y.Z
git add pyproject.toml package.json CHANGELOG.md
git commit -m "chore: bump to vX.Y.Z"
git push -u origin release/vX.Y.Z
```

### Step 5: Tag + GitHub Release

```bash
git tag -s vX.Y.Z -m "vX.Y.Z"
git push origin vX.Y.Z
```

Then on GitHub: `Draft a new release` → choose tag → write notes.

### Step 6: (Cross-repo) Bump consumer SHAs

If the release changes anything that consumers pin to (`@a1/ai` SHA, vendored
location), update consumers in this order:

1. Source repo: cut tag + release
2. Downstream consumers: bump SHA, run gate
3. Docs: update pinned references in `A1-portfolio/ARCHITECTURE.md`

## Release notes template

```markdown
## <repo> vX.Y.Z

<One-paragraph summary of what this release ships.>

### What's new in this release

- ✅ <feature 1>
- ✅ <feature 2>
- ✅ <bug fix>

### Upgrade notes

- <Breaking change A> — see <link>
- <Deprecation notice B>

### Install / upgrade

\`\`\`bash
<install command>
\`\`\`

### Full changelog

<excerpt from CHANGELOG.md>
```

## Per-repo specifics

### `autoresearch-sboss` (MIT, PyPI-eligible)

- Tag → push → `gh release create` with notes from `program.md` eval results
- PyPI publish is optional; current state is GitHub-only + vendor-by-copy
- Release cadence: per-nightly-eval-result-cluster

### `A1-Localization-{AM,RU}` (source-available, vendored)

- Tag → push → `gh release create` with notes from `CHANGELOG.md`
- **Never** push to npm. `package.json` has `"private": true` and `publishConfig.registry`
  points at GitHub Packages (org-private only)
- Consumer re-vendor is a separate per-consumer PR

### `A1-Validator` (Python, PyPI-eligible)

- Tag → push → `gh release create` with notes from `CHANGELOG.md`
- PyPI publish via `scripts/setup_pypi_token.sh` + `publish-testpypi.yml` +
  `publish-ghcr.yml` workflows
- Multi-arch Docker (amd64 + arm64) is **blocked** on docker/buildx upstream bug

### `A1-AI-Core` (`@a1/ai` — DI-contract-frozen)

- Tag → push → `gh release create` with breaking-change notes (if any)
- Breaking change = MAJOR bump + coordinated 4-repo SHA bump (see AGENTS.md §"Consumer
  bump checklist")
- Additive = MINOR bump, consumers stay on the existing SHA until they choose to bump

### `A1-Suite-Local-{MAX,ANT}`

- Tag → push → `gh release create` with sprint narrative from `deliverable.md` (MAX)
  or `HANDOFF.md` (ANT)
- ANT releases correspond to a deployed phase; MAX releases correspond to a sprint

### `A1-AI-ERP-SBOS-MSTUDIO-sovereign`

- Tag → push → `gh release create` with the corresponding `RELEASE-NOTES-v<X.Y.Z>.md`
- Per the plan convention: `v0.7.0` = Plan 5 hardening cascade, `v0.8.0` = Plan 6, etc.
- Docker images published via `publish.yml`

### `SBOS-A1-ERP`

- Tag → push → `gh release create` with wave summary from `docs/WAVE-N-SUMMARY.md`
- Open-core boundary check enforced via `scripts/check-open-core-boundary-contract.mjs`

### `A1-portfolio`

- Tag → push → `gh release create` with STATE.md delta + cross-repo coordination notes

## Rollback procedure

If a release breaks something:

1. **For engines (`A1-Localization-*`, `A1-Validator`)**: consumers revert their vendor
   update / dependency bump. The release stays tagged (history matters) but is
   superseded by the next patch.
2. **For `@a1/ai`**: consumers stay on the previous SHA until a fix is cut. Do not
   bump to the broken version.
3. **For SBOSS Sovereign**: the deploy smoke (`scripts/smoke-test.sh`) is the gate.
   If a release fails smoke, revert the deploy and tag a `-reverted` follow-up.
4. **For ANT** (live deploy): see `DEPLOYMENT.md` §"Rollback" — `DEPLOY_DEFAULT=spa`
   vs `DEPLOY_DEFAULT=legacy` flips the default UI without a rebuild.

---

*Companion to `AGENTS.md` + `CONTRIBUTING.md`. This file = release flow only.*