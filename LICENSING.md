# A1 Portfolio Licensing

**Effective:** 2026-06-21
**Owner:** Armosphera LLC
**Contact:** ops@a1-suite.local

This document is the canonical source of truth for licensing across the A1 product family. If a repo's `LICENSE` file disagrees with this document, **the `LICENSE` file wins** — but please open an issue so we can resolve the drift.

## Summary table

| Repo | Visibility | License | SPDX | Notes |
|---|---|---|---|---|
| [`SamStep74/autoresearch-sboss`](../autoresearch-sboss) | public | MIT | `MIT` | The only MIT-licensed repo. Distributed reference implementation. |
| [`Armosphera/autoresearch-sboss`](../autoresearch-sboss) | public | MIT | `MIT` | Mirror / canonical home — same content as SamStep74. |
| [`Armosphera/A1-Validator`](../A1-Validator) | public | Proprietary | `LicenseRef-Armosphera-Proprietary` | Per `LICENSE` file. Pyproject metadata matches. |
| [`Armosphera/A1-Localization-AM`](../A1-Localization-AM) | public | Proprietary | `LicenseRef-Armosphera-Proprietary` | Fiscal engines (ՀՎՀՀ, AMD, 623-account chart, VAT, payroll). |
| [`Armosphera/A1-Localization-RU`](../A1-Localization-RU) | public | Proprietary | `LicenseRef-Armosphera-Proprietary` | Fiscal engines (ИНН, ₽, НДС, НДФЛ, УПД). |
| [`Armosphera/A1-AI-Core`](../A1-AI-Core) | public | Proprietary | `LicenseRef-Armosphera-Proprietary` | Shared AI provider core. |
| [`Armosphera/A1-Suite-Local-MAX`](../A1-Suite-Local-MAX) | private | Proprietary | `LicenseRef-Armosphera-Proprietary` | Zoho-One-parity monorepo. |
| [`Armosphera/A1-Suite-Local-ANT`](../A1-Suite-Local-ANT) | private | Proprietary | `LicenseRef-Armosphera-Proprietary` | Productionized app shell. |
| [`Armosphera/A1-AI-ERP-SBOS-MSTUDIO-sovereign`](../A1-AI-ERP-SBOS-MSTUDIO-sovereign) | private | Proprietary | `LicenseRef-Armosphera-Proprietary` | Air-gapped SBOSS. |
| [`Armosphera/SBOS-A1-ERP`](../SBOS-A1-ERP) | private | Proprietary | `LicenseRef-Armosphera-Proprietary` | Open-core distribution of A1-ERP-HY (de-privatized, brand-neutral). |
| [`Armosphera/A1-portfolio`](../A1-portfolio) | public | Proprietary | `LicenseRef-Armosphera-Proprietary` | Meta-docs (licensing, architecture, security, contributing). |
| [`Armosphera/a1-cross-link-sweep`](../a1-cross-link-sweep) | public | Proprietary | `LicenseRef-Armosphera-Proprietary` | Cross-account link sweep tooling (Karpathy-eval infra). |

## Why "Proprietary" and not MIT

Two reasons:

1. **Fiscal engines are regulated.** Armenian and Russian fiscal code (chart of accounts, VAT rates, payroll formulas) is auditable territory. A wrong number isn't a bug — it's a tax liability. Armosphera LLC needs the ability to issue corrections under controlled release, not a stream of well-meaning PRs that diverge from the official SRC / НК РФ / ФНС source.
2. **Sovereign posture requires distribution control.** A1 is positioned as "sovereign, self-hostable" — meaning operators deploy the whole stack on their own hardware with no phone-home. That contract is undermined if random forks can publish modified builds claiming to be "A1".

## Open-source path (planned)

For each repo where it makes sense, we plan a **dual-license** model:

- **Engines** (`A1-Localization-AM`, `A1-Localization-RU`, `A1-Validator`, `A1-AI-Core`): re-licensed under **AGPL-3.0** with a commercial re-license path. AGPL is the right fit for "use freely, but if you deploy as a network service, publish your changes."
- **Reference / research** (`autoresearch-sboss`): stays MIT.
- **Applications** (`A1-Suite-Local-MAX`, `A1-Suite-Local-ANT`, `A1-AI-ERP-SBOS-MSTUDIO-sovereign`, `SBOS-A1-ERP`): stay proprietary (the application layer is the value capture).

This is a 2026 H2 roadmap item — not a current-state commitment. Until then, the table above is the truth.

## License-change process

1. Propose change in this repo as a PR with rationale.
2. Armosphera LLC reviews.
3. If approved, update the per-repo `LICENSE` file as a separate PR (one repo per PR) and link back to this matrix.
4. Tag a portfolio-wide release note in this repo.

## SPDX

`LicenseRef-Armosphera-Proprietary` is a custom SPDX identifier. See each repo's `LICENSE` file for the full text (the standard Armosphera proprietary license, identical across repos).