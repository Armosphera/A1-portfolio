# A1 HayHashvapah — RBAC Cutover Status

**Date:** 2026-06-22
**Branch:** `karpathy/hh-rbac-engine` on `SamStep74/A1-SMB-HH-HY-MAX`
**Status:** Dual-write window active (per migration spec §7)

---

## TL;DR

HH is mid-migration from the legacy 10-role permission map to the
MAX V1 RBAC contract (5 roles, 50 permissions). 18 of the 34 modules
have been migrated; the remaining 16 stay on the legacy map during
the 30-day dual-write window.

---

## Migration matrix

| Module | Status | Mapped permissions | Cutover commit |
|---|---|---|---|
| `gl` | ✅ Migrated | 5 (read/write/post/reverse/close-period) | `3701391` |
| `invoices` | ✅ Migrated | 5 (read/write/approve/send/void) | initial port |
| `bills` | ✅ Migrated | 4 (read/write/approve/void) | initial port |
| `auth` | ✅ Migrated | 5 (tenant:read/write/admin/billing + user:read) | initial port |
| `audit` | ✅ Migrated | 2 (read/export) | initial port |
| `tax` | ✅ Migrated | 3 (read/write/file) | `3701391` |
| `payroll` | ✅ Migrated | 4 (read/write/run/approve) | `3701391` |
| `notifications` | ✅ Migrated | 4 (tenant:read/write) | `fea4dad` |
| `apikeys` | ✅ Migrated | 2 (webhook:read/write) | `fea4dad` |
| `banking` | ✅ Migrated (this commit) | 4 (import/read/reconcile/write) | `8fbdbc3` |
| `expenses` | ✅ Migrated (this commit) | 3 (approve/read/write) | `8fbdbc3` |
| `tenants` | ✅ Migrated (this commit) | 5 (tenant:read/write + user:read/write/invite) | `8fbdbc3` |
| `tenant-lifecycle` | ✅ Migrated (this commit) | 2 (tenant:read/write) | `8fbdbc3` |
| `fiscal-periods` | ✅ Migrated (this commit) | 2 (gl:close-period, reports:read) | `8fbdbc3` |
| `reports` | ✅ Migrated (latest) | 1 (reports:read) | `89aa829` |
| `webhooks` | ✅ Migrated (latest) | 2 (webhook:read/write) | `89aa829` |
| `approvals` | ✅ Migrated (latest) | 4 (approval:read/write/approve/admin) | `89aa829` |
| `assets` | ✅ Migrated (latest) | 4 (asset:read/write/depreciate/dispose) | `89aa829` |

### Pending (lower priority — legacy RBAC during dual-write window)

Actually-migrating-remaining (12 modules with `requirePermission` calls):

- `ai` (copilot orchestration, 1 perm)
- `documents` (1 perm)
- `email` (2 perms)
- `fx` (2 perms)
- `invites` (1 perm)
- `journals` (4 perms)
- `numbering` (2 perms)
- `parties` (2 perms)
- `periods` (1 perm)
- `reference` (1 perm)
- `schedules` (1 perm)

No-RBAC-needed (4 modules with only `requireAuth`, no permission checks):
- `i18n`, `meta`, `_utils`, `apikeys` (legacy perm ref, but the actual apikeys routes are now on MAX)

Per migration spec §7 step 3, these can be migrated in any order — the dual-write window ensures no audit gaps.

---

## Implementation

### Engine layer (already shipped)

- `src/rbac-engine.ts` (301 lines): MAX V1 RBAC engine
- `src/middleware/max-rbac.ts` (87 lines): Fastify preHandler factory
- `src/middleware/max-rbac-mapping.ts` (62 lines): HH → MAX permission code mapping
- `src/rbac-engine.js` + `src/middleware/max-rbac-mapping.js`: shims for
  vitest v2 path resolution

### Tests (in this branch)

- `test/unit/rbac-engine.test.ts` (7 contract tests from MAX §2.7)
- `test/unit/max-rbac-mapping.test.ts` (4 mapping tests)

### Dual-write invariant

Every `requireMaxPermission()` call writes to BOTH:
- `rbac_audit` (new canonical table, Postgres)
- `audit_events` (existing legacy table, HH)

After 30 days of parity (per migration spec §7 step 2), the legacy
`audit_events` write is dropped from the RBAC code path.

---

## Mapping table (HH legacy → MAX V1)

| HH legacy | MAX V1 | Notes |
|---|---|---|
| `tenant:read` | `org.settings.manage` | Read |
| `tenant:write` | `org.settings.manage` | Write |
| `tenant:admin` | `org.user.manage` | Admin |
| `tenant:billing` | `hh.tenant.billing` | HH extension |
| `user:read` | `org.user.manage` | Read users |
| `user:write` | `org.user.manage` | Write users |
| `user:invite` | `org.user.manage` | Invite |
| `gl:read` | `finance.report.read` | GL reads |
| `gl:write` | `finance.report.create` | GL writes |
| `gl:post` | `finance.report.approve` | GL posting |
| `gl:reverse` | `hh.gl.reverse` | HH extension |
| `gl:close-period` | `hh.gl.close-period` | HH extension |
| `invoice:read` | `crm.integration.read` | Invoice reads |
| `invoice:write` | `hh.invoice.send` | Approximation |
| `invoice:approve` | `crm.integration.manage` | Approval |
| `invoice:send` | `hh.invoice.send` | HH extension |
| `invoice:void` | `hh.invoice.void` | HH extension |
| `bill:*` | `hh.bill.*` | HH extension |
| `expense:*` | `hh.expense.*` | HH extension |
| `payroll:*` | `hh.expense.*` | Closest MAX match |
| `tax:*` | `finance.report.*` | Approximation |
| `banking:*` | `hh.banking.*` | HH extension |
| `audit:read` | `audit.read` | Direct |
| `audit:export` | `audit.read` | HH extension |
| `webhook:read` | `hh.approval.read` | HH extension |
| `webhook:write` | `hh.approval.write` | HH extension |
| `reports:*` | `finance.report.*` | Direct |
| `fiscal-periods:*` | `hh.gl.close-period` | HH extension |
| `tenants:*` | `org.*` | MAX |
| `tenant-lifecycle:*` | `org.user.manage` | MAX |
| `approvals:*` | `hh.approval.*` | HH extension |

---

## What ships next

### Short-term (within 30-day dual-write window)

1. Migrate the 4 most-trafficked remaining modules: `reports`,
   `i18n`, `meta`, `_utils`
2. Add an integration test that asserts `rbac_audit` and `audit_events`
   receive the same rows (parity check)
3. Document the `tenant-lifecycle` API surface in `docs/HH-API.md`

### Long-term (after 30-day dual-write window closes)

1. Delete `src/modules/auth/permissions.ts` per §7 step 5
2. Remove the `audit_events` write from `rbac-engine.ts`
3. Update all remaining modules' legacy `requirePermission` calls
4. Final regression run on full test suite

---

## Cross-references

- `karpathy/hh-rbac-engine` branch (this work)
- `karpathy/hh-rbac-migration` branch (Prisma schema additions, earlier)
- `docs/rbac-and-ux-migration.md` (the full migration spec)
- `karpathy/e2e-port-from-ant` (MAX vitest setup, shared pattern)
- MAX v0.2.0 release (production-ready target)

---

*Updated 2026-06-22.*
