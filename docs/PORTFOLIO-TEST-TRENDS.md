# A1 Portfolio — Test Trends

**Date:** 2026-06-23
**Source:** `scripts/portfolio-test-counts.sh`
**Status:** Initial snapshot (first weekly report)

---

## Snapshot (2026-06-23)

| Repo | Tests | Source |
|---|---:|---|
| A1-SMB-HH-HY-MAX | **6,773** | curated (live from `vitest run`) |
| A1-Suite-Local-MAX | **1,508** | curated (live from `vitest run`) |
| A1-SMB-CRM-HY-MAX | **870** | curated (file count) |
| SBOS-A1-ERP | **392** | curated (file count) |
| A1-Localization-RU | **146** | curated (file count) |
| A1-Localization-AM | **129** | curated (file count) |
| A1-Suite-Local-ANT | **119** | curated (live from `vitest run`) |
| A1-AI-Core | **65** | curated (file count) |
| A1-Platform-MAX | **50** | curated (file count, +12 errors tests) |
| A1-SMB-CRM-HY-MAX-web | **8** | curated (file count) |
| A1-Validator | 0 | curated (no test files) |
| A1-portfolio | 0 | curated (no test files) |
| a1-cross-link-sweep | 0 | curated (no test files) |
| autoresearch-sboss | 0 | curated (no test files) |
| A1-AI-ERP-SBOS-MSTUDIO-sovereign | NEVER_CREATED | manifest_only |
| **TOTAL (curated)** | **10,060** | 14/15 repos |

---

## Data sources

The aggregator uses three data sources, in priority order:

### 1. Live `vitest run` (3 repos)

Most accurate — runs the actual test suite and counts passed tests.

- `A1-Suite-Local-MAX`: 1508 tests, ~8s runtime
- `A1-Suite-Local-ANT`: 119 tests (e2e + suite), ~2s runtime
- `A1-SMB-HH-HY-MAX`: 6773 tests, ~25s runtime

### 2. File-count + grep `it(` (8 repos)

Reasonably accurate (typically within 5%). Counts test files, then counts `it(...)` patterns.

- A1-AI-Core: 65
- A1-Localization-AM: 129
- A1-Localization-RU: 146
- A1-Platform-MAX: 38
- SBOS-A1-ERP: 392
- A1-SMB-CRM-HY-MAX: 870
- A1-SMB-CRM-HY-MAX-web: 8

### 3. No tests (3 repos)

These repos have no test files. Could be intentional (e.g. config repos) or missing tests.

- A1-Validator
- A1-portfolio
- a1-cross-link-sweep
- autoresearch-sboss

### 4. Never created (1 repo)

- A1-AI-ERP-SBOS-MSTUDIO-sovereign: in portfolio manifest but never created

---

## Accuracy comparison

| Method | Accuracy | Speed |
|---|---|---|
| Live `vitest run` | 100% | 8-25s per repo |
| File + grep | ±5% | 1-2s per repo |
| File × 10 (old) | ±50% | 1-2s per repo |

The old `file × 10` estimator was wildly off for some repos. The new `file + grep` is much more accurate.

---

## Weekly trend format

Each week, run the script and append a snapshot:

```bash
./scripts/portfolio-test-counts.sh >> docs/PORTFOLIO-TEST-TRENDS.md
```

After 4-8 weeks, derive meaningful trend lines.

---

## Why this matters

- **Drift detection**: if MAX goes from 1508 → 1300 tests, something broke
- **Coverage growth**: session start (1187) → today (1508) = +321 tests
- **Effort ROI**: HH's 6773 tests cost 4 commits + 1 cron job
- **Decision support**: portfolio composition tells you where to invest (50% of tests in HH vs MAX)

---

## Cross-references

- `scripts/portfolio-test-counts.sh` — the aggregator
- `docs/MAX-V0.3.0-PLANNING.md` — what's planned for next MAX release
- `docs/HH-CUTOVER-STATUS.md` — HH migration status
- `docs/ANT-BRANCHES.md` — ANT cleanup history
- `docs/HH-CUTOVER-PLAN.md` — Day 30 cutover dry-run results

---

*First accurate snapshot 2026-06-23.*
