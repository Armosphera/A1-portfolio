# A1 Portfolio

Cross-repo documentation for the Armosphera A1 product family.

| Doc | Purpose |
|---|---|
| [LICENSING.md](./LICENSING.md) | License matrix across all A1 repos (proprietary + MIT). |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Layer cake, data flow, open portfolio questions. |
| [SECURITY.md](./SECURITY.md) | Reporting a vulnerability, severity SLAs, egress policy. |
| [STATE.md](./STATE.md) | Latest portfolio-level snapshot — what shipped in each wave. |
| [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md) | How to file issues across the 9 repos. |
| [docs/RELEASE-PROCESS.md](./docs/RELEASE-PROCESS.md) | How releases are cut (semver, cross-repo coordination). |
| [docs/PRODUCTS.md](./docs/PRODUCTS.md) | Naming matrix: which repo is canonical for X. |
| [docs/CROSS-REPO-COORDINATION.md](./docs/CROSS-REPO-COORDINATION.md) | 8 coordination recipes for cross-repo changes (Wave 6). |
| [docs/REPO-TEMPLATE.md](./docs/REPO-TEMPLATE.md) | 9-step recipe for adding new A1 repos (Wave 7). |
| [docs/KARPATHY-EVAL-INVENTORY.md](./docs/KARPATHY-EVAL-INVENTORY.md) | 13+ Karpathy eval lanes across 8 repos (Wave 8). |
| [docs/SESSION-LOG.md](./docs/SESSION-LOG.md) | Canonical chronological log of the AI-coder enablement session (Wave 9). |
| [DUAL-LICENSE-PREP.md](./DUAL-LICENSE-PREP.md) | AGPL-3.0 + Commercial migration playbook (Wave 6). |
| [CONTRIBUTORS.md](./CONTRIBUTORS.md) | Meta-level contributor list (Wave 7). |

## Repo index

| Repo | Layer |
|---|---|
| [`Armosphera/autoresearch-sboss`](../autoresearch-sboss) | Reference |
| [`Armosphera/A1-Localization-AM`](../A1-Localization-AM) | Engine |
| [`Armosphera/A1-Localization-RU`](../A1-Localization-RU) | Engine |
| [`Armosphera/A1-Validator`](../A1-Validator) | Engine |
| [`Armosphera/A1-AI-Core`](../A1-AI-Core) | Engine |
| [`Armosphera/A1-Suite-Local-MAX`](../A1-Suite-Local-MAX) | Application | **Active** |
| [`Armosphera/A1-Suite-Local-ANT`](../A1-Suite-Local-ANT) | Application | **Frozen** (`ant-v0.1.0-frozen`) |
| [`Armosphera/SBOS-A1-ERP`](../SBOS-A1-ERP) | Application | Public distribution |
| [`Armosphera/A1-Suite-Local-ANT`](../A1-Suite-Local-ANT) | Application |
| [`Armosphera/A1-AI-ERP-SBOS-MSTUDIO-sovereign`](../A1-AI-ERP-SBOS-MSTUDIO-sovereign) | Application |
| [`Armosphera/SBOS-A1-ERP`](../SBOS-A1-ERP) | Application |
| [`Armosphera/A1-portfolio`](../A1-portfolio) | Meta-docs (this repo) |
| [`Armosphera/A1-Platform-MAX`](../A1-Platform-MAX) | Application (mirror) |
| [`Armosphera/A1-SMB-CRM-HY-MAX`](../A1-SMB-CRM-HY-MAX) | Application (mirror) |
| [`Armosphera/A1-SMB-CRM-HY-MAX-web`](../A1-SMB-CRM-HY-MAX-web) | Application (web) |
| [`Armosphera/A1-SMB-HH-HY-MAX`](../A1-SMB-HH-HY-MAX) | Application (mirror) |
| [`Armosphera/a1-cross-link-sweep`](../a1-cross-link-sweep) | Tooling |



## Product matrix (decided 2026-06-21)

The A1 portfolio has three live ERP-suite repos with non-overlapping roles:

| Repo | Role | Where new code lands |
|---|---|---|
| [`Armosphera/A1-Suite-Local-MAX`](../A1-Suite-Local-MAX) | **Active dev surface** — Turborepo monorepo, full agentic workflow stack (Phases 3-9), 11 Karpathy eval branches, Postgres adapter. | **New code lands here.** |
| [`Armosphera/A1-Suite-Local-ANT`](../A1-Suite-Local-ANT) | **Frozen live** — v0.1.0 prototype-rooted implementation, 139/140 e2e tests, 2 Karpathy eval branches. Tagged `ant-v0.1.0-frozen`. | **Frozen.** Port e2e tests into MAX over time. |
| [`Armosphera/SBOS-A1-ERP`](../SBOS-A1-ERP) | **Public open-core distribution** — receives Wave N code-flow from `A1-ERP-HY` (private R&D). Brand-neutral. | **Receives ports.** No direct dev here. |

The full decision doc (overlap analysis, cutover path, rollout) lives at [`docs/PRODUCTS.md`](./docs/PRODUCTS.md).
Owned by **Armosphera LLC**. Contact: ops@a1-suite.local.