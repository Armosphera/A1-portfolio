# Dual-License Migration Prep (AGPL-3.0 + Commercial)

**Effective:** 2026-06-21
**Owner:** Armosphera LLC
**Status:** PROPOSAL — not yet committed. See `LICENSING.md` §"Open-source path (planned)".

This document is the **migration playbook** for when Armosphera LLC decides to
dual-license the engines (`A1-Localization-AM`, `A1-Localization-RU`,
`A1-Validator`, `A1-AI-Core`) under **AGPL-3.0** with a **commercial re-license path**.

Until this migration is approved and a release tagged with the AGPL-3.0
license, the engines remain **proprietary** per the LICENSE file in each repo
and the LICENSING.md matrix.

## Why AGPL-3.0

AGPL-3.0 (GNU Affero General Public License, version 3) is the right fit because:

1. **Use freely, but if you deploy as a network service, publish your changes.**
   This aligns with the sovereign-posture philosophy: operators self-host and
   audit their own deployments, and Armosphera gets the source-available
   benefit without "drop your changes upstream or you're in violation" copyleft.

2. **Patent grant.** AGPL-3.0 includes an explicit patent grant (section 11),
   which protects users from patent litigation by contributors.

3. **Compatible with the open-core line of reasoning.** SBOS-A1-ERP is already
   positioned as open-core (de-privatized, brand-neutral); AGPL-3.0 lets the
   engines follow the same line while preserving commercial re-licensing.

4. **Industry precedent.** Many infrastructure projects (MongoDB pre-2018,
   Redis pre-2018, SugarCRM, etc.) used AGPL for the source-available side of
   their dual-license.

## What AGPL means for a consumer

When the engines move to AGPL-3.0, the consumer obligations are:

| Scenario | Obligation |
|---|---|
| Use the engine in a closed-source product distributed to end users | ✅ OK as-is (commercial re-license available) |
| Use the engine in a network-accessible service (e.g. SaaS) | ⚠️ Must publish AGPL-compatible source of any modifications to the engine |
| Fork the engine, modify it, and distribute the modifications | ⚠️ Must publish source under AGPL-3.0 |
| Vendor the engine unmodified into a sovereign single-host install | ✅ OK — pure private use, no distribution |

The key trigger is **distribution** (including "providing a network-accessible
service" under AGPL's section 13). Pure private use is unrestricted.

## Migration procedure (when approved)

When Armosphera LLC approves the migration, follow these steps **in order**.
Do not skip steps. **Plan for 2-3 weeks of total work** across multiple repos.

### Step 1: Prepare the LICENSE files (this repo + 3 engine repos)

For each of `A1-Localization-AM`, `A1-Localization-RU`, `A1-Validator`,
`A1-AI-Core`:

```bash
# Add LICENSE.AGPL-3.0 with the full AGPL text
curl -sL https://www.gnu.org/licenses/agpl-3.0.txt -o LICENSE.AGPL-3.0

# Update LICENSE to the dual-license notice (preserves proprietary + adds AGPL option)
cat > LICENSE << 'EOF'
Dual License: AGPL-3.0 OR Armosphera Proprietary (commercial).

This repository is dual-licensed under:

1. The GNU Affero General Public License, version 3 (AGPL-3.0) — see
   LICENSE.AGPL-3.0 for the full text. AGPL-3.0 is a strong copyleft license
   that requires source publication for network-accessible services.

2. The Armosphera Proprietary Commercial License — for use in closed-source
   products distributed to end users. Contact ops@a1-suite.local for a
   commercial re-license agreement.

If you are unsure which license applies to your use case, contact
ops@a1-suite.local.
EOF

# Update pyproject.toml [project] license (for Python repos) to:
#   license = { text = "AGPL-3.0-or-later OR LicenseRef-Armosphera-Commercial" }
# OR keep "LicenseRef-Armosphera-Proprietary" if going AGPL-only first.
```

### Step 2: Update each repo's `package.json` / `pyproject.toml`

For Node repos, update:

```json
"license": "AGPL-3.0 OR LicenseRef-Armosphera-Commercial",
```

For Python repos, update `pyproject.toml`:

```toml
license = { text = "AGPL-3.0-or-later OR LicenseRef-Armosphera-Commercial" }
classifiers = [
    ...
    "License :: OSI Approved :: GNU Affero General Public License v3 or later (AGPLv3+)",
    "License :: Other/Proprietary License",
]
```

Add an SPDX header to **every source file**:

```python
# SPDX-License-Identifier: AGPL-3.0-or-later OR LicenseRef-Armosphera-Commercial
# SPDX-FileCopyrightText: 2026 Armosphera LLC
```

For JavaScript:

```javascript
// SPDX-License-Identifier: AGPL-3.0-or-later OR LicenseRef-Armosphera-Commercial
// SPDX-FileCopyrightText: 2026 Armosphera LLC
```

### Step 3: Update `LICENSING.md`

Update `LICENSING.md` in this repo (`A1-portfolio`):

- Engines row: change `Proprietary` → `AGPL-3.0 + Commercial`
- Add an SPDX column note: `LicenseRef-Armosphera-Commercial-OR-AGPL-3.0-or-later`
- Update "Why Proprietary" section to "Why dual-license"
- Add "Commercial re-license" section with contact info

### Step 4: Update consumer notifications

Consumers that vendor the engines (4+ repos):

- `A1-Suite-Local-ANT`
- `A1-Suite-Local-MAX`
- `A1-AI-ERP-SBOS-MSTUDIO-sovereign`
- `SBOS-A1-ERP`

For each, file a coordinated issue: "Update vendor commit for AGPL-3.0
migration". The vendor update itself is just `git pull && re-vendor`, but the
**license terms** of the vendored copy change. Each consumer's `VENDOR.md` (or
similar) must be updated to note: "Vendored under AGPL-3.0; A1-Suite-Local-XYZ
remains proprietary."

### Step 5: Cut a coordinated release

In this order (consumer-bump checklist per `AGENTS.md`):

1. `A1-Localization-AM` v1.2.0 — first engine under AGPL-3.0 + commercial
2. `A1-Localization-RU` v0.3.0 — second engine, same scheme
3. `A1-Validator` v0.3.0 — Python validator package
4. `A1-AI-Core` v0.4.0 — shared `@a1/ai` core (DI contract unchanged, just license)
5. Update `A1-portfolio` v0.3.0 — `LICENSING.md` reflects the new matrix
6. `A1-Suite-Local-ANT` v1.2.0 — re-vendor + update VENDOR.md
7. `A1-Suite-Local-MAX` v2.2.0 — re-vendor + update VENDOR.md
8. `A1-AI-ERP-SBOS-MSTUDIO-sovereign` v0.8.0 — re-vendor + update
9. `SBOS-A1-ERP` v0.2.0 — re-vendor + update

### Step 6: Notify the world

- Post a GitHub Discussion in each repo announcing the license change
- Update any blog posts / external docs
- Email any existing commercial customers with the new agreement template

### Step 7: Update Karpathy eval lanes

The `portfolio-drift` eval lane in `A1-portfolio` already validates `LICENSING.md`
against `expected-repos.json`. After the migration:

- Update `expected-repos.json` entries to include `"spdx": "LicenseRef-Armosphera-Commercial-OR-AGPL-3.0-or-later"`
- The check will then validate that each engine's LICENSE file declares the dual-license

## What stays proprietary

Per `LICENSING.md`:

- **Reference** (`autoresearch-sboss`) — stays MIT (no migration)
- **Applications** (`A1-Suite-Local-MAX`, `A1-Suite-Local-ANT`,
  `A1-AI-ERP-SBOS-MSTUDIO-sovereign`, `SBOS-A1-ERP`) — stay proprietary
  (the application layer is the value capture)
- **Meta** (`A1-portfolio`, `a1-cross-link-sweep`) — stay proprietary
  (these aren't user-facing products)

## What becomes dual-licensed

| Repo | Current | Target |
|---|---|---|
| `A1-Localization-AM` | Proprietary | AGPL-3.0 + Commercial |
| `A1-Localization-RU` | Proprietary | AGPL-3.0 + Commercial |
| `A1-Validator` | Proprietary | AGPL-3.0 + Commercial |
| `A1-AI-Core` | Proprietary | AGPL-3.0 + Commercial |

## Commercial re-license

The "Commercial" half of the dual-license is **Armosphera Proprietary License**.
Pricing and contract template are out of scope for this document.

Contact: ops@a1-suite.local

## Estimated effort

| Step | Effort | Blockers |
|---|---|---|
| 1. LICENSE files | 2-4 hours per repo × 4 repos = 1-2 days | None |
| 2. package.json / pyproject.toml + SPDX headers | 1 day | Step 1 done |
| 3. LICENSING.md update | 1 hour | None |
| 4. Consumer notifications | 0.5 day per consumer × 4 = 2 days | None |
| 5. Coordinated release | 1 day (mostly CI + admin) | All consumers updated |
| 6. Notify the world | 1 day | Step 5 done |
| 7. Update eval lanes | 2 hours | None |

**Total: ~1 week of focused work** spread over **2-3 weeks** (allowing for review cycles on each consumer).

## Decision criteria (operator's call)

Before approving the migration, Armosphera LLC should weigh:

| Pro | Con |
|---|---|
| Wider adoption (community can deploy without commercial negotiations) | Loss of "all-rights-reserved" moat |
| AGPL patent grant protects users | Commercial competitors can fork under AGPL-3.0 without paying |
| Better fit for sovereign self-hosting story | Requires legal review of dual-license contract |
| Industry precedent | Migration is irreversible (legal interpretation of AGPL forks is well-tested) |

The decision is fundamentally business, not technical.

---

*Companion to `LICENSING.md` §"Open-source path (planned)". This file is the
playbook — `LICENSING.md` is the source of truth on the matrix itself. Until
the migration is approved, the engines remain proprietary.*