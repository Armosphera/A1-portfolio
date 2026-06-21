# A1 Product Architecture

**Effective:** 2026-06-21
**Owner:** Armosphera LLC

## Layer cake

```
┌─────────────────────────────────────────────────────────────────────┐
│  Applications (private)                                              │
│  ┌──────────────────────┐  ┌──────────────────────┐                 │
│  │ A1-Suite-Local-MAX   │  │ A1-Suite-Local-ANT   │  ← next-gen    │
│  │ (monorepo, Turbo+NX) │  │ (Fastify, web-modern)│    vs live      │
│  └──────────┬───────────┘  └──────────┬───────────┘                 │
│             │                         │                             │
│             ▼                         ▼                             │
│  ┌─────────────────────────────────────────────┐                   │
│  │   SBOS-A1-ERP / A1-AI-ERP-SBOS-MSTUDIO-     │  ← open-core     │
│  │   sovereign (Node 22 / Python 3.12)         │    vs sovereign  │
│  └────────────────────┬────────────────────────┘                   │
├───────────────────────┼─────────────────────────────────────────────┤
│  Engines (public, single source of truth)                           │
│  ┌────────────────────┴────────────────────────┐                   │
│  │  A1-Localization-AM · A1-Localization-RU    │  ← RA / RF fiscal │
│  │  A1-Validator · A1-AI-Core                 │    primitives     │
│  └─────────────────────────────────────────────┘                   │
├─────────────────────────────────────────────────────────────────────┤
│  Reference / research (public, MIT)                                │
│  ┌─────────────────────────────────────────────┐                   │
│  │  autoresearch-sboss                         │  ← Karpathy      │
│  │                                             │    keep-or-revert │
│  └─────────────────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────────────┘
```

## Repos at a glance

| Repo | Layer | Role | Status |
|---|---|---|---|
| `autoresearch-sboss` | Reference | Karpathy keep-or-revert loop, retargeted to SBOSS workflows | Research-grade. MIT. |
| `A1-Localization-AM` | Engine | RA fiscal primitives (ՀՎՀՀ, AMD, chart, VAT, payroll, einvoice) | Production-grade (engines complete, 14 tests). |
| `A1-Localization-RU` | Engine | RF fiscal primitives (ИНН, ₽, НДС, НДФЛ, УПД) | Production-grade (engines complete, 8 tests). |
| `A1-Validator` | Engine | Python port of 23 SBOSS validators (glue layer over the localizations) | Bootstrap. Not yet distributed. |
| `A1-AI-Core` | Engine | Shared AI provider core (OpenRouter, model policy, settings, open-notebook) | Production-grade. Used by 4 downstream repos. |
| `A1-Suite-Local-MAX` | Application | Next-gen Zoho-One-parity monorepo (Turbo, Next.js, 14 apps + 12 packages) | Internal-deploy ready (CI gate is real, audit→e2e→docker). |
| `A1-Suite-Local-ANT` | Application | Productionized app shell (Fastify + web-modern SPA + Karpathy evals) | Internal-deploy ready (30 phase tags, nightly e2e). |
| `A1-AI-ERP-SBOS-MSTUDIO-sovereign` | Application | Air-gapped SBOSS (Python, AMD-only, no telemetry, Merkle audit chain) | Internal-deploy ready (v0.7.0, 11 services, CHANGELOG maintained). |
| `SBOS-A1-ERP` | Application | Open-core distribution of `A1-ERP-HY` (brand-neutral, de-privatized) | Wave 0 bootstrap. RBAC first. |

## Vendor-by-copy contract (engines → apps)

All engine-layer repos (`A1-Localization-AM`, `A1-Localization-RU`, `A1-AI-Core`) are consumed by **vendoring**, not by `npm install` / `pip install`. Why:

1. **Sovereign posture** — apps must run with zero outbound network by default. A live registry dependency violates that contract.
2. **Distribution portability** — operators receive a single tarball, not "npm install on a sovereign box".
3. **Fix-flow discipline** — fixes land in the engine repo first, then re-vendored into apps. Patching a vendored copy re-introduces drift.

Each engine repo ships an `INTEGRATION.md` describing the vendor procedure. Apps vendor a specific SHA and update via a deliberate porting PR (not `npm update`).

## Cross-repo data flow

```
                        OpenRouter (opt-in, egress-gated)
                              ▲
                              │
                  ┌───────────┴───────────┐
                  │      A1-AI-Core       │
                  │  (model-policy +      │
                  │   settings + open-nb) │
                  └───────────┬───────────┘
                              │ vendor
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
    A1-Suite-Local-MAX  A1-Suite-Local-ANT  SBOS-A1-ERP
            │                 │                 │
            └────────┬────────┘                 │
                     │ vendor                   │
                     ▼                          │
          A1-Localization-AM                    │
          A1-Localization-RU                    │
                     │                          │
                     ▼                          ▼
              A1-Validator ←───  SBOS-MSTUDIO-sovereign
              (Python glue)         (air-gapped Python)
```

## Recently resolved (2026-06-21)

- **Cross-account link sweep (SamStep74 → Armosphera):** DONE via Karpathy-style `autoresearch-sboss/examples/cross-link-sweep/` — see `autoresearch-sboss/examples/cross-link-sweep/results.tsv` (baseline 15/22 → sweep → 22/22, 7 program.md files in `examples/*/` re-pointed to `Armosphera/A1-AI-Core`). The 4 downstream apps (`A1-Suite-Local-MAX`, `A1-Suite-Local-ANT`, `autoresearch-sboss` itself, `SBOS-A1-ERP`) had their `package.json` and `README.md` cross-links updated in the same sweep.
- **`WIP` repo:** deleted.
- **License drift on `A1-Validator`:** pyproject.toml updated (MIT → Armosphera Proprietary) to match the new `LICENSE` file.
- **A1-AI-Core reachability:** mirror created at `Armosphera/A1-AI-Core` (HEAD `f917e8a`, identical to `SamStep74/A1-AI-Core`). All downstream `package.json` references updated.
- **Default branch on `A1-Validator`:** fast-forwarded from `wip/bootstrap-and-port` to `main`.
- **Dependabot:** enabled across all 9 repos (npm + pip, weekly, monday 06:00). Vulnerability alerts + automated security fixes turned on.
- **`SECURITY.md`:** installed in all 9 repos, links to the portfolio-wide policy in `A1-portfolio`.

## Open portfolio questions (need owner decisions)

1. **MAX vs ANT**: which is canonical? ANT has 30 phase tags and is actively deployed; MAX is the next-gen Turbo monorepo. README of MAX says "Reimagined from `samstep74/A1-Suite-Local`" (now superseded by `Armosphera/A1-Suite-Local-MAX`) — but ANT has no deprecation note. Pick one as "live", mark the other "frozen/legacy".
2. **Sovereign Python vs SBOS-A1-ERP TypeScript**: two stacks solving overlapping domains (RBAC, i18n, finance). Same org, different runtimes, different maturity. Pick canonical SKU; archive or scope the other.
3. **`WIP` repo**: ~~empty, should be deleted~~ — RESOLVED 2026-06-21: deleted via `gh repo delete armosphera/WIP --yes`.