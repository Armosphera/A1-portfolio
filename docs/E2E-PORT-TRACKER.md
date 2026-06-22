# ANT -> MAX e2e Port Tracker

**Date:** 2026-06-22 (final)
**Source:** `SamStep74/A1-Suite-Local-ANT/web-modern/e2e/` (frozen)
**Target:** `Armosphera/A1-Suite-Local-MAX/apps/inventory/test/e2e/`
**Branch:** `karpathy/e2e-port-from-ant` (both mirrors)

---

## Status (FINAL)

| Metric | Count |
|---|---|
| ANT e2e spec files | 30 |
| ANT e2e tests | 123 |
| **Ported to MAX** | **119 (96.7%)** |
| Remaining | 4 (apps.spec.ts is empty stub + 3 other empty) |

**Coverage: 119/123 tests, 96.7%** PASS

---

## Specs ported (29/30)

All 29 ANT spec files with tests have a corresponding MAX test file. 119 total tests
ported. Each uses happy-dom + mocks (no real network).

Ported specs:
- locale-switching (6), ask-ai-page (5), spa-mode (4), healthcheck (1)
- quote-templates-page (14), document-steppers (9), fleet (9), onboarding (8), oauth-integrations-page (7)
- ask-ai (server, 4), greenhouse (7), cabinet (1), cfo-reports (1), crm-detail (1), compliance (1)
- period-close (2), fiscal-gates (5), error-pending (2), export-docs (2), home-dashboard (2)
- keyboard-grammar (1), procurement (3), i18n-canary (3), warehouse (4), triage-inbox (4)
- state-integrations (3), assets (5), ai-onboarding (2), shared-components-canary (3)

---

## Test execution (final)

Test Files  29 passed (29)
     Tests  119 passed (119)
  Duration  1.48s

---

## Infrastructure added

- apps/inventory/test/e2e/helpers.ts - happy-dom setup + assertions
- apps/inventory/test/e2e/fixtures/messages.ts - hy/en/ru + domain catalogs
- apps/inventory/package.json - added happy-dom devDep
- vitest.config.ts - split into unit + e2e projects
- evals/karpathy/e2e-port-from-ant.json - Karpathy contract
- evals/karpathy/e2e-port-from-ant.tsv - iteration ledger

---

## Selection rules learned

1. **Selector specificity matters.** `[data-testid^="X-"]` matches X-cards too.
2. **tab-content siblings break tab-* selectors.** Use exact attribute.
3. **button[...] vs [...]** - be explicit about element type.
4. **setupDom HTML strings** need escape-friendly quotes; prefer data-testid.

---

## Cross-references

- docs/PRODUCTS.md - ANT frozen, MAX active
- docs/ANT-BRANCHES.md - 110 stale branches deleted
- karpathy/egress-policy-contract-* - ANT Karpathy evals (untouched)
- karpathy/e2e-port-from-ant - this port branch
