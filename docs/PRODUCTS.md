# A1 Products — Naming & Canonical Repo Matrix

**Effective:** 2026-06-21
**Owner:** Armosphera LLC

This document answers the question: **"Which A1 repo is canonical for X?"**

## TL;DR

The A1 portfolio is **one product family** split across 9 repos. The split is
**layered** (engine → application → meta), not **redundant**. When in doubt,
follow the dependency graph:

```
autoresearch-sboss  ──port──>  A1-Validator
   │
   └─source of validators
   
A1-Localization-AM ──┐
A1-Localization-RU ──┼──vendor──>  A1-Suite-Local-ANT
A1-AI-Core          ──┘          ╲
                                 ╲──>  A1-Suite-Local-MAX
                                 ╱
A1-AI-ERP-SBOS-MSTUDIO-sovereign──╯  (also vendors AM)

SBOS-A1-ERP  ←──port──  A1-ERP-HY  (private reference, not in armosphera/)

A1-portfolio  ←──reads──  all 9 repos
```

## Canonical repo per domain

| Domain | Canonical repo | Why |
|---|---|---|
| **Armenian fiscal logic** (ՀՎՀհ, AMD, chart of accounts, VAT, payroll, e-invoice) | [`A1-Localization-AM`](../A1-Localization-AM) | Source of truth, vendor-only |
| **Russian fiscal logic** (ИНН, ОГРН, ₽, НДС, НДФЛ, УПД) | [`A1-Localization-RU`](../A1-Localization-RU) | Source of truth, vendor-only |
| **Cross-language business ID validation** (all 23 validators, Pydantic models) | [`A1-Validator`](../A1-Validator) | Ported from autoresearch-sboss |
| **AI provider core** (`@a1/ai`, OpenRouter integration, model policy, settings) | [`A1-AI-Core`](../A1-AI-Core) | DI-contract-frozen, shared by 4 consumers |
| **Reference eval-loop harness** (Karpathy autoresearch pattern) | [`autoresearch-sboss`](../autoresearch-sboss) | MIT-licensed, original source |
| **A1 Suite, next-gen** (Turbo monorepo, 14 apps + 12 packages) | [`A1-Suite-Local-MAX`](../A1-Suite-Local-MAX) | Where new apps land first |
| **A1 Suite, live** (productionized Fastify + web-modern SPA) | [`A1-Suite-Local-ANT`](../A1-Suite-Local-ANT) | Patches + sovereignty hardening only |
| **Air-gapped SBOSS** (11 services, Merkle audit, GDPR, KMS) | [`A1-AI-ERP-SBOS-MSTUDIO-sovereign`](../A1-AI-ERP-SBOS-MSTUDIO-sovereign) | Sovereign single-host |
| **Open-core ERP distribution** (de-privatized, brand-neutral) | [`SBOS-A1-ERP`](../SBOS-A1-ERP) | Wave-driven, RBAC first |
| **Cross-repo docs** (licensing, architecture, security, contributing) | [`A1-portfolio`](../A1-portfolio) | Meta layer |

## Domain boundaries (don't cross)

| Boundary | Rule |
|---|---|
| Engines ↔ Apps | Engines are vendor-by-copy. Apps never `npm install` engines — they copy `index.js + src/`. |
| Apps ↔ Apps (MAX vs ANT) | New surface area → MAX. Patches / sovereignty → ANT. ANT freezes as MAX reaches parity. |
| Apps ↔ `@a1/ai` | Apps pin to a specific `@a1/ai` SHA in `package.json`. Bumping requires coordinated PRs. |
| `A1-AI-Core` ↔ downstream | `@a1/ai` is DI-contract-frozen within a minor version. Breaking change = MAJOR bump + 4-repo coordination. |
| Sovereign ↔ Apps | Sovereign vendors `a1-localization-am`. Sovereign's `@a1/ai` is bound to its own audit chain. |
| `A1-portfolio` ↔ everything | `A1-portfolio` only contains docs. Never code, tests, or CI. |

## Naming convention

| Pattern | Examples | Meaning |
|---|---|---|
| `A1-<Engine>-<Locale>` | `A1-Localization-AM`, `A1-Localization-RU` | Locale-specific fiscal engine |
| `A1-<Domain>` | `A1-Validator`, `A1-AI-Core` | Cross-cutting library |
| `A1-Suite-Local-<Variant>` | `A1-Suite-Local-MAX`, `A1-Suite-Local-ANT` | A1 Suite deployment variants |
| `A1-AI-ERP-SBOS-MSTUDIO-<Posture>` | `A1-AI-ERP-SBOS-MSTUDIO-sovereign` | Sovereign platform with posture suffix |

## When something belongs in a NEW repo

Open a discussion issue in `A1-portfolio` first. The new repo gets:

- A row in `README.md` repo index
- A row in `LICENSING.md` license matrix
- An entry in `ARCHITECTURE.md` layer cake
- An entry in `STATE.md` with rationale

Then the new repo gets its own `AGENTS.md`, `program.md`, `.orchestration/`,
license file, and CI per the standard pattern.

## When something should be MERGED into an existing repo

Open a discussion issue in the **target** repo with:

- What is being merged
- Which repo it's coming from
- Migration plan (vendor copy, import script, port notes)
- Cross-repo coordination plan (consumer impact)

## License matrix

See [`LICENSING.md`](../LICENSING.md) for the current SPDX matrix per repo. The
short version:

- MIT: `autoresearch-sboss`
- Proprietary (`LicenseRef-Armosphera-Proprietary`): everything else
- Roadmap (2026 H2): AGPL-3.0 dual-license for engines

## Cross-repo coordination table

When you cut a release in repo X that ripples to consumer Y:

| Source (release) | Consumer (must re-vendor or re-pin) | Coordination recipe |
|---|---|---|
| `A1-Localization-{AM,RU}` | `A1-Suite-Local-ANT`, `A1-Suite-Local-MAX`, `A1-AI-ERP-SBOS-MSTUDIO-sovereign`, `SBOS-A1-ERP` | Re-vendor under `vendor/a1-localization-{am,ru}/`, update VENDOR.md with new commit SHA |
| `A1-AI-Core` | `A1-Suite-Local-MAX`, `A1-Suite-Local-ANT`, `autoresearch-sboss` | Bump `@a1/ai` SHA in `package.json` + run gate. Order: AI-Core → MAX → ANT → autoresearch-sboss → A1-portfolio docs |
| `A1-Validator` | (any consumer of `a1_validator` Python package) | `pip install a1-validator==X.Y.Z` |
| `A1-Suite-Local-MAX` | (ANT absorbs parity domains) | When MAX reaches domain parity, freeze that domain on ANT |

## Repo lifecycle stages

Every repo goes through (and may re-enter) these stages:

1. **Bootstrap** — created, basic scaffolding, no real content yet
2. **Foundation** — AGENTS.md, program.md, .orchestration/, CI green
3. **Active** — regular commits, Releases being cut
4. **Frozen** — replaced by another repo, kept for history
5. **Archived** — no longer maintained, public read-only

| Repo | Stage | Notes |
|---|---|---|
| `autoresearch-sboss` | Foundation | Eval loop + port charter |
| `A1-Validator` | Foundation | Port queue (23 rows), spawn-worker |
| `A1-Localization-AM` | Active | Engines shipped, vendored by 4 apps |
| `A1-Localization-RU` | Active | Engines shipped, vendored by 2 apps |
| `A1-AI-Core` | Active | `@a1/ai` v0.2.0, DI-contract-frozen |
| `A1-Suite-Local-MAX` | Active | 2-Day Sprint shipped (v2.0.0), next sprint in flight |
| `A1-Suite-Local-ANT` | Active | Live deploy, patches only |
| `A1-AI-ERP-SBOS-MSTUDIO-sovereign` | Active | v0.7.0 Plan 5 hardening shipped |
| `SBOS-A1-ERP` | Active (Wave 0) | RBAC first, more waves incoming |
| `A1-portfolio` | Active | Meta-docs, drift detector in `.orchestration/doc-drift-tasks.md` |

---

*Companion to `AGENTS.md` + `CONTRIBUTING.md` + `RELEASE-PROCESS.md`. This file =
"which repo owns what" only.*