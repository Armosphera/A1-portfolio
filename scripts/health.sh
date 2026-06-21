#!/usr/bin/env bash
# A1 portfolio health check.
#
# Verifies four portfolio invariants against live GitHub state:
#   1. Repo count + visibility split   (10 / 6 public / 4 private)
#   2. LICENSE present in every repo
#   3. 22-file cross-account sweep     (SamStep74 refs in program.md = 0)
#   4. Dependabot + SECURITY.md        coverage across the portfolio
#
# Exits non-zero on any invariant failure. Designed to run:
#   - Locally:        ./scripts/health.sh
#   - CI weekly:      see .github/workflows/health.yml
#   - Pre-commit:     hook before pushing large sweeps
#
# Required: gh CLI authenticated as `Armosphera` OR a token in $GITHUB_TOKEN /
# $GH_TOKEN / `gh auth token --user Armosphera`. Curl + jq + bash 3.2+.

set -euo pipefail

# -------- auth --------
if [ -z "${TOKEN:-}" ]; then
  if command -v gh >/dev/null 2>&1; then
    TOKEN=$(gh auth token --user Armosphera 2>/dev/null || gh auth token 2>/dev/null || true)
  fi
fi
if [ -z "${TOKEN:-}" ]; then
  if [ -n "${GITHUB_TOKEN:-}" ]; then TOKEN="$GITHUB_TOKEN"; fi
fi
if [ -z "${TOKEN:-}" ]; then
  echo "ERROR: no GitHub token. Run 'gh auth switch --user Armosphera' or set \$GITHUB_TOKEN." >&2
  exit 2
fi
AUTH="Authorization: token $TOKEN"
ORG="Armosphera"
API="https://api.github.com"

# -------- output helpers --------
if [ -t 1 ] && [ -z "${NO_COLOR:-}" ]; then
  RED=$'\033[31m'; GREEN=$'\033[32m'; YELLOW=$'\033[33m'; BOLD=$'\033[1m'; RESET=$'\033[0m'
else
  RED=""; GREEN=""; YELLOW=""; BOLD=""; RESET=""
fi
ok()   { printf "  %s✓%s %s\n" "$GREEN" "$RESET" "$1"; }
warn() { printf "  %s!%s %s\n" "$YELLOW" "$RESET" "$1"; }
fail() { printf "  %s✗%s %s\n" "$RED" "$RESET" "$1"; }

REPOS=(
  A1-AI-Core
  A1-Localization-AM
  A1-Localization-RU
  A1-Suite-Local-ANT
  A1-Suite-Local-MAX
  A1-AI-ERP-SBOS-MSTUDIO-sovereign
  A1-Validator
  SBOS-A1-ERP
  autoresearch-sboss
)

SWEEP_DIRS=(
  hhvh vat-return vat-return-form payroll-am chart-of-accounts-am
  phone-am regions-am einvoice-am
  ru-identifiers phone-ru ru-einvoice payroll-ru regions-ru chart-of-accounts-ru vat-ru
  model-policy chat-client settings-store model-catalog
  supplemental-sources open-notebook product-research
)

EXPECTED_TOTAL=10
EXPECTED_PUBLIC=6
EXPECTED_PRIVATE=4

errors=0
warnings=0

# -------- 1. Repo count + visibility split --------
printf "\n%s[1] Repo count + visibility split%s\n" "$BOLD" "$RESET"
meta=$(curl -s -H "$AUTH" "$API/user/repos?per_page=100&affiliation=owner")
total=$(echo "$meta" | jq '[.[] | select(.fork==false and .archived==false)] | length')
public=$(echo "$meta" | jq '[.[] | select(.fork==false and .archived==false and .private==false)] | length')
private=$(echo "$meta" | jq '[.[] | select(.fork==false and .archived==false and .private==true)] | length')

printf "  total=%s public=%s private=%s (expected total=%s public=%s private=%s)\n" \
  "$total" "$public" "$private" "$EXPECTED_TOTAL" "$EXPECTED_PUBLIC" "$EXPECTED_PRIVATE"
if [ "$total" -eq "$EXPECTED_TOTAL" ] && [ "$public" -eq "$EXPECTED_PUBLIC" ] && [ "$private" -eq "$EXPECTED_PRIVATE" ]; then
  ok "repo count matches expected"
else
  fail "repo count drift (expected $EXPECTED_TOTAL/$EXPECTED_PUBLIC/$EXPECTED_PRIVATE, got $total/$public/$private)"
  errors=$((errors + 1))
fi

# -------- 2. LICENSE in every repo --------
printf "\n%s[2] LICENSE present in every repo%s\n" "$BOLD" "$RESET"
lic_missing=0
for r in "${REPOS[@]}"; do
  s=$(curl -s -H "$AUTH" "$API/repos/$ORG/$r/contents/LICENSE" | jq -r '.name // "MISSING"')
  if [ "$s" = "LICENSE" ]; then
    ok "$r"
  else
    fail "$r: $s"
    lic_missing=$((lic_missing + 1))
  fi
done
if [ "$lic_missing" -eq 0 ]; then
  ok "LICENSE present in all ${#REPOS[@]} repos"
else
  fail "$lic_missing repos missing LICENSE"
  errors=$((errors + 1))
fi

# -------- 3. 22-file cross-account sweep --------
printf "\n%s[3] 22-file cross-account sweep (program.md SamStep74 refs)%s\n" "$BOLD" "$RESET"
drift=0
for d in "${SWEEP_DIRS[@]}"; do
  c=$(curl -s -H "$AUTH" "$API/repos/$ORG/autoresearch-sboss/contents/examples/$d/program.md" \
      | jq -r '.content // ""' | base64 -d 2>/dev/null \
      | { grep -c "SamStep74\|samstep74" 2>/dev/null || true; } | head -1)
  c=${c:-0}
  if [ "$c" = "0" ]; then
    ok "$d"
  else
    fail "$d: $c SamStep74 ref(s) remain"
    drift=$((drift + c))
  fi
done
if [ "$drift" -eq 0 ]; then
  ok "sweep clean: ${#SWEEP_DIRS[@]}/${#SWEEP_DIRS[@]} program.md files point to Armosphera mirror"
else
  fail "sweep drift: $drift SamStep74 refs across ${#SWEEP_DIRS[@]} files"
  errors=$((errors + 1))
  warn "re-run 'cd autoresearch-sboss/examples/cross-link-sweep && python3 workflow.py && python3 eval.py'"
fi

# -------- 4. Dependabot + SECURITY.md coverage --------
printf "\n%s[4] Dependabot + SECURITY.md coverage%s\n" "$BOLD" "$RESET"
cov_missing=0
for r in "${REPOS[@]}"; do
  dep=$(curl -s -H "$AUTH" "$API/repos/$ORG/$r/contents/.github/dependabot.yml" | jq -r '.name // "MISSING"')
  sec=$(curl -s -H "$AUTH" "$API/repos/$ORG/$r/contents/.github/SECURITY.md"   | jq -r '.name // "MISSING"')
  if [ "$dep" = "dependabot.yml" ] && [ "$sec" = "SECURITY.md" ]; then
    ok "$r"
  else
    fail "$r: dep=$dep sec=$sec"
    cov_missing=$((cov_missing + 1))
  fi
done
if [ "$cov_missing" -eq 0 ]; then
  ok "Dependabot + SECURITY.md present in all ${#REPOS[@]} repos"
else
  fail "$cov_missing repos missing dependabot/SECURITY"
  errors=$((errors + 1))
fi

# -------- summary --------
printf "\n%s=== Summary ===%s\n" "$BOLD" "$RESET"
if [ "$errors" -eq 0 ]; then
  printf "%sOK%s — all 4 portfolio invariants hold\n" "$GREEN" "$RESET"
  exit 0
else
  printf "%sFAIL%s — %s error(s), %s warning(s)\n" "$RED" "$RESET" "$errors" "$warnings"
  exit 1
fi
