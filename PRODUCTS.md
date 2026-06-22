# PRODUCTS.md

**Naming matrix** — which `armosphera/<repo>` is canonical for which domain.

This is a portfolio-wide index. If a repo's `README.md` disagrees with this document,
`README.md` wins — but please open an issue to resolve the drift.

## Engines (lowest layer)

| Domain | Canonical repo | License | Vendored by |
|--------|----------------|---------|-------------|
| `@a1/ai` core (AI provider, OpenRouter, settings, model policy) | `armosphera/A1-AI-Core` | MIT | A1-Suite-Local-ANT (git-pinned), autoresearch-sboss (git-cloned), A1-Suite-Local-MAX (**TypeScript fork**, see below) |
| Russian (RU) fiscal: ИНН/ОГРН, НДС, НДФЛ, pension (НК РФ ст. 425) | `armosphera/A1-Localization-RU` | Proprietary | A1-Suite-Local-ANT, A1-Suite-Local-MAX (vendored) |
| Armenian (RA) fiscal: ՀՎՀՀ, AMD, chart of accounts, VAT return, payroll, **pension (RA Tax Code Art. 156)** | `armosphera/A1-Localization-AM` | Proprietary | A1-Suite-Local-ANT, A1-Suite-Local-MAX (vendored) |
| SBOSS sovereign business workflows (eval-loop reference) | `armosphera/autoresearch-sboss` | MIT | A1-Suite-Local-ANT, A1-Suite-Local-MAX (consumed) |
| Business ID validators (41 international IDs) | `armosphera/A1-Validator` | Proprietary | (none yet — Python package, future) |
| Cross-portfolio docs / registry | `armosphera/A1-portfolio` | Proprietary | (this repo) |

## Applications (consume engines)

| Product | Repo | Engine consumption pattern |
|---------|------|-----------------------------|
| `A1-Suite-Local-ANT` (LIVE deploy) | `armosphera/A1-Suite-Local-ANT` | Vendors `@a1/ai` + A1-Localization-{AM,RU} |
| `A1-Suite-Local-MAX` (next-gen) | `armosphera/A1-Suite-Local-MAX` | **TypeScript fork** of `@a1/ai` in `packages/ai/` (NOT a vendor) + vendored A1-Localization-{AM,RU} |
| `A1-AI-ERP-SBOS-MSTUDIO-sovereign` | `armosphera/A1-AI-ERP-SBOS-MSTUDIO-sovereign` | Vendors A1-Localization-{AM,RU} + `@a1/ai` |
| `SBOS-A1-ERP` | `armosphera/SBOS-A1-ERP` | Vendors A1-Localization-{AM,RU} + `@a1/ai` |
| `A1-Platform-MAX` | `armosphera/A1-Platform-MAX` | (mirror — minimal) |
| `A1-SMB-CRM-HY-MAX-web` | `armosphera/A1-SMB-CRM-HY-MAX-web` | (mirror — public) |
| `A1-SMB-CRM-HY-MAX` | `armosphera/A1-SMB-CRM-HY-MAX` | (mirror — Karpathy lane) |
| `A1-SMB-HH-HY-MAX` | `armosphera/A1-SMB-HH-HY-MAX` | (mirror — Karpathy lane) |

## Reference (eval-loop, schemas)

| Purpose | Repo |
|---------|------|
| Eval-loop research harness | `armosphera/autoresearch-sboss` |
| Cross-portfolio drift detection | `armosphera/A1-portfolio` (scripts/check-portfolio-drift.js) |
| Karpathy eval lanes (3 in A1-AI-Core) | `armosphera/A1-AI-Core/evals/` |
| Cross-link sweep | `armosphera/a1-cross-link-sweep` |

## Special: MAX @a1/ai TypeScript fork

**Decision (Issue #6, 2026-06-22):** Option 2 — accept the TypeScript fork as architectural.

- `A1-Suite-Local-MAX` keeps its own `@a1/ai` package in `packages/ai/` (TypeScript, ESM, Vite).
- This is **not** a vendor of `armosphera/A1-AI-Core` (which is CommonJS, zero-runtime-deps).
- Fork divergence is **explicit**, not accidental.

**Karpathy lane coverage:**
- `A1-AI-Core/evals/di-contract-frozen/check.js` — covers upstream CommonJS.
- `A1-Suite-Local-MAX/evals/a1-ai-fork-contract/check.js` — covers MAX TypeScript fork (TODO).
- Both lanes must pass independently before any `@a1/ai` bump.

**Cross-portfolio SHA bump plan:**
- ANT pins to git SHA (`armosphera/A1-AI-Core.git#cec47006`).
- MAX fork is **independent** — it imports its local `packages/ai` (no SHA pin to upstream).
- When upstream API changes, MAX must update its own fork (separate workstream).
- `scripts/state/sha-bump.sh` only updates consumers that pin to upstream (ANT, autoresearch-sboss).

See `A1-AI-Core/AGENTS.md` §"Consumer bump checklist" for the 4-repo coordinated bump pattern
(applies to ANT + autoresearch-sboss + A1-portfolio docs; NOT MAX).

## Vendored vs fork vs mirror

- **Vendored** — copy of upstream into repo (e.g. `A1-Localization-RU/src/`, `vendor/` dir).
  Re-pull via `python scripts/_vendor.py` or `npm run vendor`. Pinned to git SHA or package version.
- **Fork** — independent re-implementation in repo (e.g. `MAX/packages/ai/`).
  Maintained separately. Drift is explicit.
- **Mirror** — read-only copy used for visibility / marketing / reference (e.g. `A1-Platform-MAX`).
  No consumption. May be deleted or upstream-merged at any time.

## When to update this file

- New A1 repo added → add row to "Engines" or "Applications" or "Reference" section.
- Engine consumed by a new product → update "Vendored by" column.
- Architectural decision (fork vs vendor vs mirror) changes → update "Special" section + open issue.
- License change → update "License" column.

*Per `armosphera/A1-portfolio/AGENTS.md` §2, this file is one of the 4 load-bearing docs.
If you change it, also check `LICENSING.md`, `ARCHITECTURE.md`, and `README.md` for consistency.*