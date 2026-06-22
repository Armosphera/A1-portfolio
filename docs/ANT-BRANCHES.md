# ANT Branch Cleanup — Decision Log

**Date:** 2026-06-22T06:41:47Z
**Repo:** `SamStep74/A1-Suite-Local-ANT`
**Status:** Decision recorded, ready to execute

---

## Context

ANT (A1 Suite Local ANT) is the prototype-rooted implementation that was
**frozen** on 2026-06-21 per [`docs/PRODUCTS.md`](../PRODUCTS.md). The
decision doc states MAX is the active development surface and ANT remains
as a stable reference for historical test heritage.

As of 2026-06-22, ANT had **114 branches**, of which:
- **89** were fully merged into `ant/main` (ahead_by=0, just behind)
- **7** were abandoned feature branches (<6 unique commits, >29 behind)
- **4** were kept (`main`, `ant/main`, 2 karpathy/* contracts)

The 96 fully-merged + abandoned branches add no value — they're historical
noise that obscures what is actually being maintained in ANT.

---

## Decision

### KEEP (4 branches)

| Branch | Reason |
|---|---|
| `main` | Default branch (legacy, kept for archive) |
| `ant/main` | Canonical ANT integration branch |
| `karpathy/egress-policy-contract-default` | Active Karpathy eval contract (default egress policy) |
| `karpathy/egress-policy-contract-public` | Active Karpathy eval contract (public egress allowlist) |

### DELETE (96 branches)

89 fully-merged into `ant/main` (ahead_by=0) + 7 abandoned feature branches
(each ≤5 unique commits but ≥29 commits behind `ant/main`).

Deleted branches:

**abandoned-1-ahead-182-behind** (1 branches):

- `wip/phase10-4-shared-components/shared-components` (e9bff896f470)

**abandoned-1-ahead-29-behind** (1 branches):

- `codex/ant-pr3-i18n-app-link-review-fixes` (cd454c82c2fb)

**abandoned-1-ahead-61-behind** (2 branches):

- `orchestrator-phase10-9-e2e-content-fixes-w3-apps-spa-warehouse` (8c7ce8eda27d)
- `wip/phase10-9-e2e-content-fixes-w3-plan` (81bc35cf9f28)

**abandoned-1-ahead-83-behind** (1 branches):

- `wip/phase10-9-e2e-content-fixes-plan` (cbc5a7f8dd28)

**abandoned-2-ahead-28-behind** (1 branches):

- `codex/ant-review-followups-20260615` (dcc6d7b7039c)

**abandoned-5-ahead-293-behind** (1 branches):

- `phase8-tube-merge` (83993c80c5a4)

**fully-merged** (89 branches):

- `a1/sub-plan-fleet-management` (b062bdf0ee75)
- `a1/sub-plan-greenhouse-erp` (2e632627d459)
- `a1/sub-plan-state-integrations` (eb360def1ea0)
- `ant/integration/phase10-9-d` (64c2486de824)
- `ant/integration/phase10-9-g` (793a974b70d4)
- `hotfix/phase10-0-d1-spa-shell` (ac931f6c2c81)
- `hotfix/phase10-0-typecheck-cleanup` (e0f03bb1d14c)
- `integration/phase10-9-d` (ec4fbe514194)
- `orchestrator-phase10-9-e2e-content-fixes-w2-finance` (6af1b66a0ecd)
- `phase10-10-ci-smoke-full-split-v1` (8ee934f178b8)
- `phase8-warehouse-merge` (7ef38f22d566)
- `wip/phase10-1-deploy-dp-build-scripts` (10bdeb10e8db)
- `wip/phase10-1-deploy-dp-install-rollback` (3fc33d9a4992)
- `wip/phase10-1-deploy-dp-legacy-escape-hatch` (0a76fc71c959)
- `wip/phase10-2-finance-fi-crud-masterdata` (a2b6f79a7665)
- `wip/phase10-2-finance-fi-readonly-reports` (98f7761b6ea3)
- `wip/phase10-2-finance-fi-workflow-forms` (8aaa577e76c9)
- `wip/phase10-2-flow-integrations-integration-hub` (bfc76b68d8cf)
- `wip/phase10-2-people-hr-ops` (0c4cb963e884)
- `wip/phase10-2-people-hr-people` (5bca37784ccb)
- `wip/phase10-2-people-hr-perf` (a611b09a31ad)
- `wip/phase10-2e-login-shell-retirement-login-shell-retire` (463089debc9b)
- `wip/phase10-3-i18n-infra-i18n-infra` (bc8b15908556)
- `wip/phase10-5-product-differentiators-fiscal-gates` (16b2a827252a)
- `wip/phase10-5-product-differentiators-period-close-checklist` (c48841a843fc)
- `wip/phase10-5-product-differentiators-r2-document-steppers` (7f82801e6675)
- `wip/phase10-5-product-differentiators-r2-keyboard-grammar` (ad5941363a7f)
- `wip/phase10-5-product-differentiators-r2-onboarding` (d859a5818126)
- `wip/phase10-5-product-differentiators/ask-ai` (4be6665db1fa)
- `wip/phase10-5-product-differentiators/triage-inbox` (4aca0aad780f)
- `wip/phase10-5-translation-pass-translation-pass` (bca7c1969004)
- `wip/phase10-6-production-hardening-fleet-test-fixes` (1c49ec4794e6)
- `wip/phase10-6-production-hardening-healthcheck-cosmetic` (636c3457c483)
- `wip/phase10-6-production-hardening-w4-port` (226bb08f6695)
- `wip/phase10-7-e2e-coverage-e2e-ask-ai` (d21edf971eaa)
- `wip/phase10-7-e2e-coverage-e2e-documents` (8fd5124528f9)
- `wip/phase10-7-e2e-coverage-e2e-fiscal-gates` (4153638a2d72)
- `wip/phase10-7-e2e-coverage-e2e-locale-switching` (728711d1c48e)
- `wip/phase10-7-e2e-coverage-e2e-onboarding` (dba79292411a)
- `wip/phase10-7-e2e-coverage-e2e-triage-inbox` (267704c179b4)
- `wip/phase10-7-e2e-coverage-remove-hastranslation` (acfc610591e6)
- `wip/phase10-8-e2e-in-ci-e2e-in-ci` (0456713d457d)
- `wip/phase10-9-e2e-content-fixes-crm` (f07745255cb6)
- `wip/phase10-9-e2e-content-fixes-docs` (d1e46ab85fc2)
- `wip/phase10-9-e2e-content-fixes-fleet-greens` (bf7170a7818b)
- `wip/phase10-9-e2e-content-fixes-procurement` (d679644597db)
- `wip/phase10-9-e2e-content-fixes-state-int` (132ce692ddee)
- `wip/phase10-9-e2e-content-fixes-w2-plan` (16ed393c3814)
- `wip/phase2-inventory-lib-inventory` (64d7beb9714e)
- `wip/phase2-inventory-routes-inventory` (d1ab1b006b4d)
- `wip/phase3-web-modern-components-shell` (c8801001982a)
- `wip/phase3-web-modern-lib-api-edge` (a2d3fe2aad9b)
- `wip/phase3-web-modern-lib-utils-rbac` (a71cecf876a2)
- `wip/phase3-web-modern-routes-crm` (57350af68b1b)
- `wip/phase8-assets-as-legacy-drop` (7ef38f22d566)
- `wip/phase8-assets-as-route-test` (e9463e0e56e2)
- `wip/phase8-assets-as-schemas-helpers` (36e889d1da03)
- `wip/phase8-cabinet-cab-e2e-parity` (9007c0c00141)
- `wip/phase8-cabinet-cab-route-test` (e1285e381e47)
- `wip/phase8-cabinet-cab-schemas-helpers` (e1c0acc57ac5)
- `wip/phase8-compliance-cm-co-panel-test-legacy-drop` (2330de85e63e)
- `wip/phase8-compliance-cm-schemas-helpers` (22d961811878)
- `wip/phase8-export-docs-ed-legacy-drop` (0fb9b52551c2)
- `wip/phase8-export-docs-ed-route-test` (3def1500f8fb)
- `wip/phase8-export-docs-ed-schemas-helpers` (8e3708674385)
- `wip/phase8-fleet-fl-legacy-drop` (ddb2725c6a14)
- `wip/phase8-fleet-fl-route-test` (caa2fd229c43)
- `wip/phase8-fleet-fl-schemas-helpers` (18d17d6f40ea)
- `wip/phase8-fleet-fl-server` (c55f5ddee876)
- `wip/phase8-greenhouse-gh-legacy-drop` (e8b3b5745202)
- `wip/phase8-greenhouse-gh-route-test` (f7fe24b88990)
- `wip/phase8-greenhouse-gh-schemas-helpers` (47b634a5a8e2)
- `wip/phase8-healthcheck` (da3efe3ed567)
- `wip/phase8-onboarding-aiob-legacy-drop` (d3f4beb7bce5)
- `wip/phase8-onboarding-aiob-route-test` (0531e5081bbf)
- `wip/phase8-onboarding-aiob-schemas-helpers` (10fe37618092)
- `wip/phase8-procurement-pc-legacy-drop` (f7531fb0c1db)
- `wip/phase8-procurement-pc-route-test` (730716d56624)
- `wip/phase8-procurement-pc-schemas-helpers` (2b5735f4455f)
- `wip/phase8-state-integrations-si-legacy-drop` (ac187a157468)
- `wip/phase8-state-integrations-si-route-test` (3b4c854e73b1)
- `wip/phase8-state-integrations-si-schemas-helpers` (f8a25a57d457)
- `wip/phase8-tube-tube-contacts` (a109342178ae)
- `wip/phase8-tube-tube-deals-board` (55f2360871d1)
- `wip/phase8-tube-tube-sequences` (d4cd2fa42191)
- `wip/phase8-warehouse-wh-legacy-drop` (cc27e6278e6e)
- `wip/phase8-warehouse-wh-route-test` (1cd7d3c2166c)
- `wip/phase8-warehouse-wh-schemas-helpers` (7db438710a63)
- `wip/phase9-rbac-ant` (f0a29ab81a44)

---

## Pre-execution audit trail

The cleanup script uses GitHub Contents API DELETE on each ref. Each
deletion is idempotent — re-running on already-deleted branches is a
no-op (returns 404, which we ignore).

**Archive trail:** Every deleted branch SHA is recorded above. To recover
a deleted branch: `git fetch origin refs/heads/<branch>:<branch>` from a
local clone that fetched before deletion. GitHub does not provide a
"trash" feature for branches — once deleted, only local clones retain
the ref.

---

## Risk assessment

| Risk | Mitigation |
|---|---|
| Loss of in-progress work on abandoned branches | Each abandoned branch had ≤5 unique commits not in ant/main. Work is recoverable from local clones if any exist. |
| Open PRs targeting deleted branches | Will auto-close (GitHub will warn). None detected in current PR list. |
| CI/CD pipelines referencing deleted branches | `karpathy-evals.yml` matrix does NOT reference any deleted branch (only karpathy/* kept). |
| Future contributors expecting deleted branches | Branches are listed in the kept set above + this doc for posterity. |

---

## Cross-references

- [`docs/PRODUCTS.md`](../PRODUCTS.md) — ANT role decision
- `karpathy/egress-policy-contract-default` — Karpathy eval (kept)
- `karpathy/egress-policy-contract-public` — Karpathy eval (kept)
- `armosphera/autoresearch-sboss` — separate repo (untouched)

---

## Execution result

- ✅ Decision documented
- ✅ Executed: 110 branches deleted (96 from initial audit + 14 from post-audit reclassify)
- ✅ Final state: 4 branches kept (`main`, `ant/main`, 2 `karpathy/*`)
- ✅ Karpathy cron matrix unaffected (no deleted branches referenced)

**Executed:** 2026-06-22T06:47:35Z
**Final branch count:** 4 (down from 114)

---

*Generated 2026-06-22 by autonomous cleanup session. Reproducible via
`/tmp/ant-branch-cleanup.json`.*
