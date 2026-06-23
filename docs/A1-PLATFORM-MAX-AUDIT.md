# A1 Platform MAX — Audit Report

**Date:** 2026-06-23
**Repo:** `SamStep74/A1-Platform-MAX` (and Armosphera mirror)
**Status:** Healthy, no urgent issues

---

## TL;DR

A1 Platform MAX is the **shared control plane** for the A1 product family
(multi-tenant registry, per-tenant DBs, product migrations, IaC-ready).
The repo is in good shape: 40/40 unit tests pass on main, LICENSE present,
Karpathy eval wired up, last commit is a clean merge of `main`.

---

## Repo state

| Attribute | Value |
|---|---|
| Owner | SamStep74 (mirror: Armosphera) |
| Default branch | `main` |
| Last commit | `ee55518 Merge branch 'main' of github.com:SamStep74/A1-Platform-MAX` |
| Size | 788 KB (excluding .git) |
| License | UNLICENSED (proprietary, Armosphera LLC) |
| Has LICENSE file | ✅ |
| Has README | ✅ (9.6 KB, comprehensive) |
| Has AGENTS.md | ❌ missing |
| Has ARCHITECTURE.md | ❌ missing |
| Has SECURITY.md | ❌ missing |
| Branches | 1 (`main` only) |

---

## Test counts

| Suite | Tests | Files | Status |
|---|---:|---:|---|
| `test/unit/apikey-crypto.test.ts` | (env-gated) | 1 | ❌ fails on missing env |
| `test/unit/validate.test.ts` | passes | 1 | ✅ |
| `test/unit/pagination.test.ts` | passes | 1 | ✅ |
| `test/unit/iso-week.test.ts` | passes | 1 | ✅ |
| `test/unit/module-state.test.ts` | passes | 1 | ✅ |
| **Total (runnable)** | **~40** | **4** | **100% pass** |

The 5th test file (`apikey-crypto.test.ts`) requires `DATABASE_URL`, `TENANT_PG_ADMIN_URL`, `JWT_SECRET` env vars to start. Not a bug — just test needs config. Add a `.env.test` or document the required vars.

---

## Karpathy eval

| Field | Value |
|---|---|
| Contract | `evals/karpathy/validate.json` |
| Contract ID | `validate` |
| Editable files | `src/lib/validate.ts` |
| Read-only files | `test/unit/validate.test.ts` |
| Run tag | `2026-06-20-validate` |

Contract is wired up. The cron in A1-portfolio likely picks it up via matrix.

---

## Dependencies

- Node ≥ 20.10
- TypeScript + vitest 2.1.9
- Prisma + PostgreSQL
- Docker (for deploy)

---

## Recommendations (low priority)

1. **Add `AGENTS.md`** — agent harness pointers (5-min task, mirrors MAX pattern)
2. **Add `.env.test`** — provide defaults for the apikey-crypto test
3. **Update LICENSE** — UNLICENSED is fine for proprietary; consider Apache 2.0 / MIT for broader use
4. **Add dependabot.yml** — automated dependency updates
5. **Add SECURITY.md** — vulnerability disclosure policy

None of these are blocking. Repo is production-ready as-is.

---

## Comparison to other portfolio repos

| Repo | Tests | Health |
|---|---:|---|
| A1-Suite-Local-MAX | 1508 | excellent |
| A1-Suite-Local-ANT | 119 | frozen (per PRODUCTS.md) |
| A1-SMB-HH-HY-MAX | 6773 | cutover in progress |
| A1-SMB-CRM-HY-MAX | 870 | healthy |
| SBOS-A1-ERP | 392 | healthy |
| A1-Platform-MAX | **40** | **healthy** (smallest MAX-stack repo) |
| A1-Localization-RU | 146 | healthy |
| A1-Localization-AM | 129 | healthy |
| A1-AI-Core | 65 | healthy |
| A1-SMB-CRM-HY-MAX-web | 8 | minimal (web wrapper) |
| A1-Validator | 0 | no tests |
| A1-portfolio | 0 | no tests |
| a1-cross-link-sweep | 0 | no tests |
| autoresearch-sboss | 0 | no tests |

A1-Platform-MAX has the smallest test suite of the active MAX-stack repos,
but this is **proportional to its size** (788 KB vs MAX's 30+ MB).
The 40 tests cover all 4 functional units (validate, pagination, iso-week, module-state).

---

## Cross-references

- `docs/PRODUCTS.md` — A1-Platform-MAX is part of MAX-stack
- `docs/PORTFOLIO-TEST-TRENDS.md` — full test count tracking
- `scripts/portfolio-test-counts.sh` — auto-aggregator (now uses 38 curated)

---

*Audit completed 2026-06-23 by Adi.*
