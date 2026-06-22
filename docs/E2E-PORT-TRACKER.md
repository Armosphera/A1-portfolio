# ANT → MAX e2e Port Tracker

**Date:** 2026-06-22T06:54:59Z
**Source:** `SamStep74/A1-Suite-Local-ANT/web-modern/e2e/` (frozen)
**Target:** `Armosphera/A1-Suite-Local-MAX/apps/inventory/test/e2e/`
**Branch:** `karpathy/e2e-port-from-ant`

---

## Status

| Metric | Count |
|---|---|
| ANT e2e spec files | 30 (33 in tree, 3 are helpers/fixtures) |
| ANT e2e tests (counted) | 123 |
| Ported to MAX (this commit) | 19 |
| Remaining | 104 |

**Port ratio:** 19 / 123 = 15.4%

---

## Ported (this commit)

| ANT spec | MAX test file | Tests |
|---|---|---|
| `locale-switching.spec.ts` | `apps/inventory/test/e2e/locale-switching.test.ts` | 6 |
| `ask-ai-page.spec.ts` (smoke) | `apps/inventory/test/e2e/ask-ai-page.test.ts` | 5 |
| `spa-mode.spec.ts` | `apps/inventory/test/e2e/spa-mode.test.ts` | 4 |
| `healthcheck.spec.ts` | `apps/inventory/test/e2e/healthcheck.test.ts` | 1 |
| (helpers) | `apps/inventory/test/e2e/helpers.ts` | — |
| (fixtures) | `apps/inventory/test/e2e/fixtures/messages.ts` | — |

**Strategy:** Replace Playwright browser clicks with happy-dom DOM unit
tests. Business logic (locale routing, i18n string resolution, hydration
marker, legacy bundle guard) is preserved.

---

## Translation strategy

ANT tests use **Playwright** to drive a real browser. MAX uses **vitest**
with **happy-dom** for DOM unit testing.

### Equivalent operations

| Playwright (ANT) | vitest + happy-dom (MAX) | Notes |
|---|---|---|
| `page.goto('/url')` | `setupDom(html)` | Inject HTML directly |
| `page.click('#btn')` | DOM `dispatchEvent(new Event('click'))` | Same effect, no real pointer |
| `page.fill('#input', 'text')` | `input.value = 'text'; dispatchEvent('input')` | React/Vue state must be manually advanced |
| `expect(page.locator(...)).toContainText(...)` | `expect(document.querySelector(...).textContent).toBe(...)` | Same assertion |
| `page.waitForResponse(...)` | `flushDom()` then assert | 100ms async wait |
| `page.screenshot()` | n/a | Visual regression is not ported |
| Browser network | Mock with vi.mock | No real fetch in vitest |

### Limitations of the port

- **No visual regression.** Pixel-level diffs are not ported. ANT's
  Playwright `expect.toHaveScreenshot()` calls would need a separate
  visual regression framework (Percy, Chromatic).
- **No real network.** ANT tests hit a real Fastify backend at
  `localhost:4100`. MAX port uses mocks via `vi.mock('./api.js')`.
  This catches logic regressions but misses integration issues.
- **DOM-only.** Tests can't simulate gestures (swipe, long-press),
  drag-drop, or browser-level concerns (back button, focus rings).

### When to use ANT vs MAX test

- **ANT tests** = full-stack smoke. Run weekly in CI to catch
  integration regressions. Slow but comprehensive.
- **MAX tests** = fast unit-level regressions. Run on every commit.
  Fast and focused.

Both are needed. The port is to bring ANT's **test coverage** into
MAX's **fast feedback loop**, not to replace ANT.

---

## Remaining to port (priority order)

The 104 remaining tests fall into these groups. Port them in batches of
~15-25 tests per commit, following the pattern in this commit.

### High priority (business-critical UX)

| ANT spec | Tests | Notes |
|---|---|---|
| `quote-templates-page.spec.ts` | 14 | Largest single spec. Quote editor flow. |
| `document-steppers.spec.ts` | 9 | Wizard navigation + validation. |
| `fleet.spec.ts` | 9 | Vehicle/driver/trip/fuel forms. |
| `onboarding.spec.ts` | 8 | 5-tour badge + tour walking. |
| `oauth-integrations-page.spec.ts` | 8 | OAuth integration settings. |
| `ask-ai-page.spec.ts` (full) | 3 | The 3 tests skipped from this port. |
| `ask-ai.spec.ts` | 4 | Ask AI server-side (not just page). |
| `greenhouse.spec.ts` | 7 | Greenhouse ERP module. |
| `cabinet.spec.ts` | 1 | Cabinet module smoke. |
| `cfo-reports.spec.ts` | 1 | CFO reports page. |
| `crm-detail.spec.ts` | 1 | CRM detail page. |
| `compliance.spec.ts` | 1 | Compliance page. |
| `period-close.spec.ts` | 2 | Finance period close. |
| `fiscal-gates.spec.ts` | 5 | Fiscal gates validation. |
| `error-pending.spec.ts` | 2 | Error state UX. |
| `export-docs.spec.ts` | 2 | Document export. |
| `home-dashboard.spec.ts` | 2 | Home dashboard layout. |
| `keyboard-grammar.spec.ts` | 1 | Keyboard shortcuts. |
| `procurement.spec.ts` | 3 | Procurement forms. |
| `i18n-canary.spec.ts` | 3 | i18n canary checks (2 more). |
| `warehouse.spec.ts` | 4 | Warehouse management. |
| `triage-inbox.spec.ts` | 4 | Triage inbox. |
| `state-integrations.spec.ts` | 3 | State integrations. |
| `assets.spec.ts` | 5 | Asset management. |
| `ai-onboarding.spec.ts` | 2 | AI onboarding flow. |
| `shared-components-canary.spec.ts` | 3 | Shared components. |

Total: ~104 tests.

---

## How to port a new spec

1. Read ANT spec: `gh api repos/SamStep74/A1-Suite-Local-ANT/contents/web-modern/e2e/<spec>.ts?ref=ant/main`
2. Identify the business assertions (text presence, URL changes, element state)
3. Skip Playwright-specific operations (clicks via real mouse, visual diffs)
4. Create `apps/inventory/test/e2e/<spec>.test.ts` using happy-dom
5. Add the same fixture data to `fixtures/messages.ts` if i18n-related
6. Run `pnpm test apps/inventory/test/e2e/` to verify
7. Commit on `karpathy/e2e-port-from-ant` branch
8. Update this tracker

---

## Cross-references

- `docs/PRODUCTS.md` — MAX active, ANT frozen (the source of this port)
- `docs/ANT-BRANCHES.md` — ANT branch cleanup (110 branches deleted)
- `karpathy/egress-policy-contract-default` — ANT Karpathy eval (untouched)
- `karpathy/workflow-runtime` — MAX workflow runtime (different concern)
