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
- **Dependabot:** enabled across all 10 repos (npm + pip, weekly, monday 06:00). Vulnerability alerts + automated security fixes turned on. **Includes `A1-AI-Core` mirror**.
- **`SECURITY.md`:** installed in all 10 repos, links to the portfolio-wide policy in `A1-portfolio`.

## Operational checks (re-run anytime)

The following one-liners verify portfolio invariants against the live GitHub state.
Run them after any large sweep, branch protection change, or org rename.
They assume you have a token with `repo` scope on the armosphera account:

```bash
TOKEN=*** auth token --user Armosphera)
AUTH="Authorization: token $TOKEN"
```

### 1. Repo count + visibility split

```bash
curl -s -H "$AUTH" "https://api.github.com/user/repos?per_page=100&affiliation=owner" \
  | jq '[.[] | select(.fork==false and .archived==false)] \
       | {total: length, \
          public:  [.[] | select(.private==false)] | length, \
          private: [.[] | select(.private==true)]  | length}'
```

Expected: `{ "total": 10, "public": 6, "private": 4 }`.

### 2. LICENSE present in every repo

```bash
for r in A1-AI-Core A1-Localization-AM A1-Localization-RU A1-Suite-Local-ANT \
         A1-Suite-Local-MAX A1-AI-ERP-SBOS-MSTUDIO-sovereign \
         A1-Validator SBOS-A1-ERP autoresearch-sboss; do
  status=$(curl -s -H "$AUTH" "https://api.github.com/repos/Armosphera/$r/contents/LICENSE" \
           | jq -r '.name // "MISSING"')
  printf "%-45s %s\n" "$r" "$status"
done
```

Expected: every line ends in `LICENSE`.

### 3. 22-file cross-account sweep — all program.md files clean

```bash
for d in hhvh vat-return vat-return-form payroll-am chart-of-accounts-am \
         phone-am regions-am einvoice-am ru-identifiers phone-ru \
         ru-einvoice payroll-ru regions-ru chart-of-accounts-ru vat-ru \
         model-policy chat-client settings-store model-catalog \
         supplemental-sources open-notebook product-research; do
  count=$(curl -s -H "$AUTH" \
    "https://api.github.com/repos/Armosphera/autoresearch-sboss/contents/examples/$d/program.md" \
    | jq -r '.content // ""' | base64 -d 2>/dev/null \
    | grep -c "SamStep74\|samstep74")
  printf "%-25s %s\n" "$d" "$count"
done
```

Expected: all 22 lines show `0`. The Karpathy-loop `examples/cross-link-sweep/eval.py`
is the canonical version of this check — it also computes the 0-22 score and exits 0 on full pass.

### 4. Dependabot + SECURITY.md + vulnerability-alerts coverage

```bash
for r in A1-AI-Core A1-Localization-AM A1-Localization-RU A1-Suite-Local-ANT \
         A1-Suite-Local-MAX A1-AI-ERP-SBOS-MSTUDIO-sovereign \
         A1-Validator SBOS-A1-ERP autoresearch-sboss; do
  dep=$(curl -s -H "$AUTH" "https://api.github.com/repos/Armosphera/$r/contents/.github/dependabot.yml" | jq -r '.name // "MISSING"')
  sec=$(curl -s -H "$AUTH" "https://api.github.com/repos/Armosphera/$r/contents/.github/SECURITY.md"   | jq -r '.name // "MISSING"')
  printf "%-45s dep=%-15s sec=%s\n" "$r" "$dep" "$sec"
done
```

Expected: every line ends in `dep=dependabot.yml  sec=SECURITY.md`.

### 5. Re-run the Karpathy autoresearch loop in-place

```bash
git clone https://github.com/Armosphera/autoresearch-sboss.git /tmp/ar
cd /tmp/ar/examples/cross-link-sweep
python3 eval.py        # prints score: 22 / 22 on a clean main
# To re-run a sweep:
python3 workflow.py    # commits any drift back to Armosphera mirror
```

Expected: `score: 22 / 22 | elapsed: ~10s`. Exit code 0 = portfolio invariant holds.

### 6. One-shot portfolio health (chained)

```bash
#!/usr/bin/env bash
# A1 portfolio health check — exits non-zero if any invariant fails.
set -e
TOKEN=*** auth token --user Armosphera)
H_A="Authorization: token $TOKEN"
fail() { echo "FAIL: $*" >&2; exit 1; }

# 1) Repo count
n=$(curl -s -H "$H_A" "https://api.github.com/user/repos?per_page=100&affiliation=owner" \
    | jq '[.[] | select(.fork==false and .archived==false)] | length')
[ "$n" -eq 10 ] || fail "expected 10 repos, got $n"

# 2) LICENSE in all 10
for r in A1-AI-Core A1-Localization-AM A1-Localization-RU A1-Suite-Local-ANT \
         A1-Suite-Local-MAX A1-AI-ERP-SBOS-MSTUDIO-sovereign \
         A1-Validator SBOS-A1-ERP autoresearch-sboss A1-portfolio; do
  s=$(curl -s -H "$H_A" "https://api.github.com/repos/Armosphera/$r/contents/LICENSE" | jq -r '.name // "MISSING"')
  [ "$s" = "LICENSE" ] || fail "$r missing LICENSE"
done

# 3) 22/22 sweep
drift=0
for d in hhvh vat-return vat-return-form payroll-am chart-of-accounts-am \
         phone-am regions-am einvoice-am ru-identifiers phone-ru \
         ru-einvoice payroll-ru regions-ru chart-of-accounts-ru vat-ru \
         model-policy chat-client settings-store model-catalog \
         supplemental-sources open-notebook product-research; do
  c=$(curl -s -H "$H_A" \
       "https://api.github.com/repos/Armosphera/autoresearch-sboss/contents/examples/$d/program.md" \
       | jq -r '.content // ""' | base64 -d 2>/dev/null \
       | grep -c "SamStep74\|samstep74")
  drift=$((drift + c))
done
[ "$drift" -eq 0 ] || fail "cross-link sweep: $drift SamStep74 refs remaining"

echo "OK — portfolio invariants hold (10 repos, 10 LICENSE, 22/22 sweep clean)"
```

Wire this into a GitHub Actions cron (`schedule: weekly`) under `Armosphera/A1-portfolio/.github/workflows/health.yml`
for automated monitoring.

## Open portfolio questions (need owner decisions)

1. **MAX vs ANT**: which is canonical? ANT has 30 phase tags and is actively deployed; MAX is the next-gen Turbo monorepo. README of MAX says "Reimagined from `samstep74/A1-Suite-Local`" (now superseded by `Armosphera/A1-Suite-Local-MAX`) — but ANT has no deprecation note. Pick one as "live", mark the other "frozen/legacy".
2. **Sovereign Python vs SBOS-A1-ERP TypeScript**: two stacks solving overlapping domains (RBAC, i18n, finance). Same org, different runtimes, different maturity. Pick canonical SKU; archive or scope the other.
3. **`WIP` repo**: ~~empty, should be deleted~~ — RESOLVED 2026-06-21: deleted via `gh repo delete armosphera/WIP --yes`.