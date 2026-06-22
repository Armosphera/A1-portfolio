#!/usr/bin/env node
/**
 * evals/karpathy/portfolio-agents-correct/check.js
 *
 * Cross-repo Karpathy lane. Verifies that no engine/app repo's
 * AGENTS.md is identical to A1-portfolio's AGENTS.md.
 *
 * The A1-portfolio/AGENTS.md is the **cross-repo documentation charter**.
 * It is correct ONLY for A1-portfolio itself. Every other repo must have
 * a **repo-specific** AGENTS.md that documents:
 *   - the repo's layer (Engine / Application / Reference)
 *   - the repo's contract surface (public API, DI contracts, etc.)
 *   - the repo's local conventions (TDD rules, sovereignty posture, etc.)
 *
 * Skip rules:
 *   - A1-portfolio itself (it IS the source — identical is correct)
 *   - Mirror repos (layer "Reference" + small size): no AGENTS.md expected
 *   - Repos without AGENTS.md: OK (just no charter)
 *
 * Three such regressions have been fixed in 2026-06-22:
 *   - A1-AI-Core (commit 8560169 → restored in f5084f5)
 *   - A1-AI-ERP-SBOS-MSTUDIO-sovereign (commit c586377 → restored in be5c146)
 *   - autoresearch-sboss (commit 3c1e6e4 → restored in 4b38f5a)
 *
 * This lane prevents future regressions.
 *
 * Run:
 *   node evals/karpathy/portfolio-agents-correct/check.js
 *
 * Exit 0 = all engine/app repos have repo-specific AGENTS.md.
 * Exit 1 = at least one regression.
 */

"use strict";

const fs = require("fs");
const path = require("path");

const ARMOS_ROOT = path.join(process.env.HOME || "/Users/samvelstepanyan", "dev", "armosphera");
const PORTFOLIO_AGENTS_PATH = path.join(ARMOS_ROOT, "src", "A1-portfolio", "AGENTS.md");
const EXPECTED_REPOS_PATH = path.join(ARMOS_ROOT, "src", "A1-portfolio", "expected-repos.json");

const PORTFOLIO_AGENTS = fs.readFileSync(PORTFOLIO_AGENTS_PATH, "utf8");
const EXPECTED_REPOS = JSON.parse(fs.readFileSync(EXPECTED_REPOS_PATH, "utf8")).repos;

// A1-portfolio is the source — identical is correct (skip the check)
const SOURCE_REPO = "A1-portfolio";

// Mirror repos are read-only copies — may or may not have AGENTS.md
// (just skip them — they shouldn't be checked)
const MIRROR_REPOS = new Set([
  "A1-Platform-MAX",
  "A1-SMB-CRM-HY-MAX",
  "A1-SMB-CRM-HY-MAX-web",
  "A1-SMB-HH-HY-MAX",
]);

let failed = false;
let checked = 0;
let ok = 0;
let skipped = 0;
let regressions = 0;

console.log(`Checking ${EXPECTED_REPOS.length} repos for AGENTS.md regression...`);
console.log();

for (const repo of EXPECTED_REPOS) {
  if (repo.name === SOURCE_REPO) {
    console.log(`⊘ ${repo.name}: source repo (skipped)`);
    skipped++;
    continue;
  }

  if (MIRROR_REPOS.has(repo.name)) {
    console.log(`⊘ ${repo.name}: mirror repo (skipped)`);
    skipped++;
    continue;
  }

  const localPath = path.join(ARMOS_ROOT, "src", repo.name, "AGENTS.md");
  if (!fs.existsSync(localPath)) {
    // No AGENTS.md — for Engine/Application repos this IS a problem
    if (repo.layer === "Engine" || repo.layer === "Application") {
      console.error(`✗ ${repo.name} (${repo.layer}): missing AGENTS.md (should have one)`);
      regressions++;
      failed = true;
    } else {
      console.log(`⊘ ${repo.name} (${repo.layer}): no AGENTS.md (skipped)`);
      skipped++;
    }
    continue;
  }

  checked++;
  const content = fs.readFileSync(localPath, "utf8");
  if (content === PORTFOLIO_AGENTS) {
    // REGRESSION — this repo's AGENTS.md is identical to A1-portfolio's
    console.error(`✗ ${repo.name} (${repo.layer}): AGENTS.md is IDENTICAL to A1-portfolio/AGENTS.md (regression!)`);
    regressions++;
    failed = true;
  } else {
    console.log(`✓ ${repo.name} (${repo.layer}): AGENTS.md is repo-specific (${content.length} bytes)`);
    ok++;
  }
}

console.log();
console.log(`Total: ${EXPECTED_REPOS.length} repos, ${checked} checked, ${ok} OK, ${regressions} regressions, ${skipped} skipped`);

if (failed) {
  console.log();
  console.log("✗ portfolio-agents-correct contract violations detected.");
  console.log();
  console.log("Fix: each repo with regression needs its own AGENTS.md restored.");
  console.log("Look up the original commit via: git log --all --diff-filter=D -- AGENTS.md");
  console.log("or check the operator's pattern (commits with 'docs: add AGENTS.md (agent harness pointers)').");
  process.exit(1);
} else {
  console.log();
  console.log("✓ All engine/app repos have repo-specific AGENTS.md (no regression to A1-portfolio's).");
  process.exit(0);
}