# HH-HY vs MAX RBAC Bridge — Cross-Check Report

Date: 2026-06-21
Author: Mac OC

## Overview

Two RBAC bridge implementations have been deployed:

| Aspect | MAX codebase (A1-SMB-HH-HY-MAX) | HH-HY codebase (SamStep74/A1-SMB-HH-HY) |
|---|---|---|
| Stack | TypeScript + Fastify + Postgres | JavaScript + node:http + JSON file |
| Auth model | Permission codes (50+ HH codes) | Roles (owner/admin/editor/viewer) |
| Storage | rbac_user_roles + rbac_role_permissions tables | account.members[] in JSON |
| Bridge module | rbac-bridge.ts + rbac-bridge-middleware.ts | rbac-bridge.js |
| Wrapper | requirePermissionBridge(perm) | bridgeRequireRole(role, required) |
| Env vars | RBR_ENABLED, RBR_METRICS_ENABLED, RBR_METRICS_PORT | Same 3 env vars |
| Metrics port | 9091 | 9091 |
| Metrics format | Prometheus text | Prometheus text |
| Tests | vitest, 64 unit + 8 integration | node:test, 16 unit |
| Tests passing | ✅ all 72 | ✅ all 16 |
| Karpathy cron | ✅ deployed | ⚠️ needs manual push (workflow scope) |
| Baseline equivalence | ✅ verified (live integration tests) | ✅ verified (5 routes × legacy/bridge) |

## Status of dev HH-HY pilot (macstudio)

- ✅ Server runs with RBR_ENABLED=1 (PID dynamic, restart after edit)
- ✅ /metrics endpoint on :9091 emits rbac_bridge_requests_total
- ✅ Baseline equivalence: legacy = bridge for 5 tested routes
- ✅ bridgeRequireEditor added (line 342 wrapper)
- ✅ BRIDGE_TRACE debug log removed
- ✅ All 7 requireOwner callsites wrapped (verified via grep)
- ✅ 16 unit tests passing (node:test)
- ⚠️ Karpathy cron file in `.github-pending/` awaiting manual push (workflow scope)

## Status of MAX production plan (from Wave 14)

- ✅ Migration SQL applied (5 tables: rbac_roles, rbac_permissions, rbac_role_permissions, rbac_user_roles, rbac_audit)
- ✅ Data migration seed (HH Membership.role → MAX rbac_user_roles)
- ✅ 27 route files migrated to guard() pattern
- ✅ Integration tests passing against live Postgres
- ✅ Bridge middleware emits metrics
- ✅ Karpathy evals cron in place on MAX repo
- ✅ Grafana dashboard deployed

## Differences (why two implementations)

1. **Permission granularity**: MAX needs fine-grained per-permission code checks
   (financial posting, void, etc.) while HH-HY only needs role-level (owner vs viewer).

2. **Storage**: MAX has a real RBAC database (Postgres + rbac_* tables) while HH-HY
   has only role assignments stored alongside the account record.

3. **Route count**: MAX has 27 route modules with ~10 permission checks each.
   HH-HY has fewer route handlers with mostly role-based gates.

4. **Migration path**: MAX migrates from 50+ HH codes to 29 MAX codes. HH-HY
   stays with its existing 4-role model and just adds metrics.

## Production rollout plan (HH-HY)

1. **Now** ✅ — Bridge module + tests on dev, verified equivalent to legacy
2. **24h monitoring** — Let it run on dev, watch /metrics for any anomalies
3. **Tomorrow** — Deploy to staging with RBR_ENABLED=1
4. **48h** — Compare staging metrics to legacy baseline
5. **Day 5** — Production rollout with rollback plan
6. **Day 7** — Deprecate requireOwner() legacy variant (only guard() allowed)

## Production rollout plan (MAX)

1. **Now** — Code in place, tests pass
2. **This week** — Apply migration SQL to staging DB
3. **Next week** — Pilot RBR_ENABLED=1 in dev for 24h
4. **Week 3** — Staging rollout
5. **Week 4** — Production rollout with monitoring
