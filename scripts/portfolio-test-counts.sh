#!/usr/bin/env bash
# A1 Portfolio — Test Count Aggregator
#
# Counts tests across the 15 portfolio repos. Uses a mix of:
#   - Known accurate counts (curated, updated when tests change)
#   - Approximate counts (file_count * 10, for repos without manual updates)
#
# Usage:
#   ./scripts/portfolio-test-counts.sh
#   ./scripts/portfolio-test-counts.sh --json  # machine-readable

set -euo pipefail

# Known accurate counts (updated 2026-06-23 via clone + count)
KNOWN_COUNTS=(
  "A1-Suite-Local-MAX:1508"
  "A1-Suite-Local-ANT:119"
  "A1-SMB-HH-HY-MAX:6773"
  "A1-AI-Core:65"
  "A1-Localization-AM:129"
  "A1-Localization-RU:146"
  "A1-Platform-MAX:50"
  "SBOS-A1-ERP:392"
  "A1-SMB-CRM-HY-MAX:870"
  "A1-SMB-CRM-HY-MAX-web:8"
  "A1-Validator:0"
  "A1-portfolio:0"
  "a1-cross-link-sweep:0"
  "autoresearch-sboss:0"
)

REPOS=(
  A1-AI-Core
  A1-Localization-AM
  A1-Localization-RU
  A1-Suite-Local-ANT
  A1-Suite-Local-MAX
  A1-Platform-MAX
  A1-AI-ERP-SBOS-MSTUDIO-sovereign
  A1-Validator
  SBOS-A1-ERP
  A1-SMB-HH-HY-MAX
  A1-SMB-CRM-HY-MAX
  A1-SMB-CRM-HY-MAX-web
  A1-portfolio
  a1-cross-link-sweep
  autoresearch-sboss
)

JSON=false
while [[ $# -gt 0 ]]; do
  case $1 in
    --json) JSON=true; shift ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

# Helper: get known count
get_known() {
  local repo="$1"
  for entry in "${KNOWN_COUNTS[@]}"; do
    if [ "${entry%%:*}" = "$repo" ]; then
      echo "${entry##*:}"
      return 0
    fi
  done
  return 1
}

if [ "$JSON" = false ]; then
  echo "=== A1 Portfolio Test Counts ==="
  echo "    (snapshot $(date -u +%Y-%m-%dT%H:%M:%SZ))"
  printf "%-45s %12s %10s\n" "repo" "tests" "source"
  echo "----------------------------------------------------------------------"
fi

TOTAL=0
JSON_OUTPUT="["
FIRST=1

for repo in "${REPOS[@]}"; do
  if count=$(get_known "$repo"); then
    if [ "$JSON" = true ]; then
      if [ $FIRST -eq 0 ]; then JSON_OUTPUT+=","; fi
      JSON_OUTPUT+='{"repo":"'$repo'","tests":'$count',"source":"known"}'
      FIRST=0
    else
      printf "%-45s %12s %10s\n" "$repo" "$count" "curated"
    fi
    TOTAL=$(( TOTAL + count ))
  else
    # Special case: known-missing repos (in manifest but never created)
  if [ "$repo" = "A1-AI-ERP-SBOS-MSTUDIO-sovereign" ]; then
    if [ "$JSON" = true ]; then
      if [ $FIRST -eq 0 ]; then JSON_OUTPUT+=","; fi
      JSON_OUTPUT+='{"repo":"'$repo'","tests":0,"status":"never_created"}'
      FIRST=0
    else
      printf "%-45s %12s %10s
" "$repo" "NEVER_CREATED" "manifest_only"
    fi
    continue
  fi

  # Estimate
    file_count=0
    for org in Armosphera SamStep74; do
      if gh api "repos/$org/$repo" >/dev/null 2>&1; then
        file_count=$(gh api "repos/$org/$repo/git/trees/HEAD?recursive=0" --jq '.tree | length' 2>/dev/null || echo "0")
        break
      fi
    done
    est=$(( file_count * 10 ))
    if [ "$JSON" = true ]; then
      if [ $FIRST -eq 0 ]; then JSON_OUTPUT+=","; fi
      JSON_OUTPUT+='{"repo":"'$repo'","tests":'$est',"source":"estimated","files":'$file_count'}'
      FIRST=0
    else
      printf "%-45s %12s %10s\n" "$repo" "$est (est)" "approx"
    fi
    TOTAL=$(( TOTAL + est ))
  fi
done

if [ "$JSON" = true ]; then
  JSON_OUTPUT+="]"
  echo "$JSON_OUTPUT" | jq .
else
  echo "----------------------------------------------------------------------"
  printf "%-45s %12s\n" "TOTAL" "$TOTAL"
fi
