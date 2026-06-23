# A1 Portfolio — Test Trends

**Date:** 2026-06-23
**Source:** `scripts/portfolio-test-counts.sh`
**Status:** Initial snapshot (first weekly report)

---

## Snapshot (2026-06-23)

| Repo | Tests | Source |
|---|---:|---|
| A1-Suite-Local-MAX | **1,508** | curated (live from `vitest run`) |
| A1-Suite-Local-ANT | **119** | curated (e2e suite — happy-dom) |
| A1-SMB-HH-HY-MAX | **6,773** | curated (module tests) |
| A1-AI-Core | ~640 | estimated (file count × 10) |
| A1-Localization-AM | ~560 | estimated |
| A1-Localization-RU | ~530 | estimated |
| A1-Platform-MAX | ~720 | estimated |
| A1-AI-ERP-SBOS-MSTUDIO-sovereign | ~9,600 | estimated |
| A1-Validator | ~1,650 | estimated |
| SBOS-A1-ERP | ~3,810 | estimated |
| A1-SMB-CRM-HY-MAX | ~2,140 | estimated |
| A1-SMB-CRM-HY-MAX-web | ~540 | estimated |
| A1-portfolio | ~550 | estimated |
| a1-cross-link-sweep | ~170 | estimated |
| autoresearch-sboss | ~2,880 | estimated |
| **TOTAL (curated + estimated)** | **~32,190** | mixed |

---

## Curated vs Estimated

The aggregator uses two data sources:

- **Curated** (3 repos): counted from actual test runs via `vitest run --json` output. Updated whenever a new release is tagged.
- **Estimated** (12 repos): file count × 10 (rough heuristic, ±50% accuracy).

For more accurate counts on estimated repos, clone + run tests + update the curated list. This is best done in dedicated audit sessions.

---

## Weekly trend format

Each week, run the script and append a snapshot:

```bash
./scripts/portfolio-test-counts.sh >> docs/PORTFOLIO-TEST-TRENDS.md
```

This builds a running history. After 4-8 weeks, you can derive meaningful trend lines.

---

## Why this matters

- **Drift detection**: if MAX goes from 1508 → 1300 tests, something broke (likely a merge or test rot)
- **Coverage growth**: from session start (1187) → today (1508), MAX gained +321 tests
- **Effort ROI**: HH RBAC migration's 6773 tests cost 4 commits + 1 cron job
- **Decision support**: portfolio composition (e.g. 50% of tests in HH vs MAX) tells you where to invest

---

## Cross-references

- `scripts/portfolio-test-counts.sh` — the aggregator
- `docs/MAX-V0.3.0-PLANNING.md` — what's planned for the next MAX release
- `docs/HH-CUTOVER-STATUS.md` — HH migration status
- `docs/ANT-BRANCHES.md` — ANT cleanup history

---

*First snapshot 2026-06-23.*
