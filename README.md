# A1 Portfolio

Cross-repo documentation for the Armosphera A1 product family.

| Doc | Purpose |
|---|---|
| [LICENSING.md](./LICENSING.md) | License matrix across all A1 repos (proprietary + MIT). |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Layer cake, data flow, open portfolio questions. |
| [SECURITY.md](./SECURITY.md) | Reporting a vulnerability, severity SLAs, egress policy. |

## Repo index

| Repo | Layer |
|---|---|
| [`Armosphera/autoresearch-sboss`](../autoresearch-sboss) | Reference |
| [`Armosphera/A1-Localization-AM`](../A1-Localization-AM) | Engine |
| [`Armosphera/A1-Localization-RU`](../A1-Localization-RU) | Engine |
| [`Armosphera/A1-Validator`](../A1-Validator) | Engine |
| [`Armosphera/A1-AI-Core`](../A1-AI-Core) | Engine |
| [`Armosphera/A1-Suite-Local-MAX`](../A1-Suite-Local-MAX) | Application |
| [`Armosphera/A1-Suite-Local-ANT`](../A1-Suite-Local-ANT) | Application |
| [`Armosphera/A1-AI-ERP-SBOS-MSTUDIO-sovereign`](../A1-AI-ERP-SBOS-MSTUDIO-sovereign) | Application |
| [`Armosphera/SBOS-A1-ERP`](../SBOS-A1-ERP) | Application |

Owned by **Armosphera LLC**. Contact: ops@a1-suite.local.

## Health check

This repo ships a portfolio-wide health check: [`scripts/health.sh`](./scripts/health.sh).

It verifies four invariants against the live GitHub API:

1. Repo count + visibility split (11 / 7 public / 4 private)
2. `LICENSE` file present in every portfolio repo
3. 22-file cross-account sweep — via [`a1-cross-link-sweep`](https://github.com/Armosphera/a1-cross-link-sweep), a Karpathy-pattern autoresearch harness. Exits 0 when all 22 `autoresearch-sboss/examples/*/program.md` files point at the right source repo.
4. Dependabot + `SECURITY.md` coverage across all repos

Run it locally:

```bash
gh auth switch --user Armosphera
./scripts/health.sh
```

It is also wired as a **weekly GitHub Actions cron** (`.github/workflows/health.yml`, Mondays 08:00 UTC).
On drift it auto-opens a labelled issue with the failing log and a "Suggested fixes" checklist.

Detailed one-liners for each check live in [`ARCHITECTURE.md` § Operational checks](./ARCHITECTURE.md#operational-checks-re-run-anytime).

