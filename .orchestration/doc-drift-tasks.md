# Documentation drift tasks — A1-portfolio

Status checklist. `[x]` = shipped + verified against `gh API` ground truth.

## Repo index drift (`README.md`)

- [x] Add all 9 active repos (autoresearch-sboss, A1-Validator, A1-Localization-AM,
      A1-Localization-RU, A1-AI-Core, A1-portfolio, A1-Suite-Local-ANT,
      A1-Suite-Local-MAX, A1-AI-ERP-SBOS-MSTUDIO-sovereign)
- [ ] Remove `A1-portfolio/WIP` reference (already deleted upstream)
- [ ] Verify SBOS-A1-ERP is listed in the index
- [ ] Verify A1-AI-Core is listed under "Engine" not "Application"

## License matrix drift (`LICENSING.md`)

- [ ] Cross-check each repo's actual LICENSE file vs the SPDX column
- [ ] Note: `A1-Validator` pyproject says MIT but LICENSE says Proprietary —
      resolve drift (already documented in LICENSING.md as known issue)
- [ ] Add SPDX `LicenseRef-Armosphera-Proprietary` references where missing
- [ ] Verify `autoresearch-sboss` MIT is dual-listed (SamStep74 + Armosphera mirror)

## Architecture layer cake drift (`ARCHITECTURE.md`)

- [ ] Add A1-AI-Core to the engine layer (currently not in the layer cake)
- [ ] Add A1-portfolio as a meta-layer above applications
- [ ] Cross-check the "Application" layer includes all 4 apps (MAX, ANT,
      sovereign, SBOS-A1-ERP)

## SECURITY.md drift

- [ ] Update "Supported versions" table to include v0.7.0 for sovereign
- [ ] Update "Supported versions" table to include v1.0.0/v2.0.0 for ANT/MAX
- [ ] Add SBOS-A1-ERP "Wave 1+" status once Wave 1 ships

## TODO docs (create from AGENTS.md §9)

- [ ] `docs/CONTRIBUTING.md` — how to file issues against the right repo
- [ ] `docs/RELEASE-PROCESS.md` — how releases are cut (tag, notes, publishing)
- [ ] `docs/PRODUCTS.md` — naming matrix: which repo is canonical for X

## Drift detection CI (Karpathy eval lane)

- [ ] Add `portfolio-drift-contract` eval lane: scripted check that README,
      LICENSING.md, ARCHITECTURE.md, SECURITY.md match the org's actual repos
- [ ] Wire as CI check on this repo

## 2026 H2 roadmap

- [ ] AGPL-3.0 dual-license migration for engines
- [ ] Cross-repo evaluation report (which repos have AGENTS.md, program.md,
      .orchestration/, Karpathy eval lanes — vs which don't)

## Coordination

- This repo is read by every agent before touching any other A1 repo.
- Major changes (e.g. AGPL-3.0 migration) need an ADR before they land here.