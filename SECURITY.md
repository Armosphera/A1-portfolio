# Security Policy

**Effective:** 2026-06-21
**Owner:** Armosphera LLC
**Contact (security):** ops@a1-suite.local (GPG: TBD)

## Supported versions

| Repo family | Supported versions | Status |
|---|---|---|
| Engines (AM, RU, Validator, A1-AI-Core) | latest tag on default branch | Active |
| Application shells (MAX, ANT) | latest deploy-tag | Active |
| SBOSS Sovereign | v0.7.0+ | Active |
| SBOS-A1-ERP | Wave 1+ | Active once cut |

Versions older than the latest tag are unsupported. Please upgrade before filing a security report.

## Reporting a vulnerability

**Please do NOT file a public GitHub issue for security vulnerabilities.**

Email `ops@a1-suite.local` with:
- Subject prefix: `[SECURITY] <repo-name>`
- Description of the issue
- Reproduction steps (or PoC)
- Affected commit SHA / tag
- Your contact info for follow-up

We acknowledge within **48 hours** and triage within **5 business days**.

## Severity classification

We follow CVSS v3.1. Critical / High issues receive an embargoed fix; Medium / Low may roll into the next scheduled release.

| CVSS | Response target |
|---|---|
| Critical (9.0–10.0) | Patch within 7 days |
| High (7.0–8.9) | Patch within 30 days |
| Medium (4.0–6.9) | Patch within 90 days |
| Low (0.1–3.9) | Next scheduled release |

## Outbound network policy

A1 applications run with **outbound network OFF by default**. The opt-in contract is documented per-app:
- `A1-Suite-Local-MAX` / `-ANT`: `ARMOSPHERA_ONE_ALLOW_EGRESS=1` + `ARMOSPHERA_ONE_EGRESS_ALLOWLIST` (comma-separated hostnames).
- `A1-AI-ERP-SBOS-MSTUDIO-sovereign`: `ALLOW_EGRESS=0` default; per-host allowlist at the gateway.
- `A1-AI-Core` (engine): egress gate injected at the consumer (`isEgressAllowed`), default deny.

Loopback (`127.0.0.1`, `::1`) is always allowed.

## Audit chain (sovereign deployments)

SBOSS Sovereign writes every state mutation to a SHA-256 Merkle audit chain. The chain is re-verified on every chat read (no silent divergence). See `A1-AI-ERP-SBOS-MSTUDIO-sovereign` `docs/DEPLOY.md` §6 for the sovereignty contract.

## Dependency policy

- Engines: minimum-dependency philosophy. `A1-Localization-AM` and `A1-Localization-RU` have **zero runtime deps**; `A1-Validator` depends on `pydantic>=2.0,<3` only; `A1-AI-Core` has framework-agnostic peer-style deps.
- Apps: pin exact versions for production (`package-lock.json` / `uv.lock` committed), weekly Dependabot scan (production + dev), severity threshold `moderate`.

## Disclosure timeline (post-fix)

After a fix is released, we publish:
1. GitHub Security Advisory on the affected repo(s).
2. Entry in the portfolio `CHANGELOG` (in `A1-portfolio`).
3. Credit to the reporter (unless anonymity was requested).

We follow **coordinated disclosure** — please give us the response window above before any public write-up.