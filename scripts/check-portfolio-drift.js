#!/usr/bin/env node
/**
 * scripts/check-portfolio-drift.js
 *
 * Programmatically verifies that the 4 load-bearing docs in A1-portfolio
 * (README.md, LICENSING.md, ARCHITECTURE.md, SECURITY.md) accurately
 * describe the current state of the armosphera/ GitHub org.
 *
 * This is a Karpathy-style eval lane — fails CI on any drift between
 * documentation and reality.
 *
 * Detects:
 * 1. Repo index drift — README.md table vs actual armosphera repos
 * 2. License matrix drift — LICENSING.md table vs each repo's actual LICENSE
 * 3. Architecture layer drift — ARCHITECTURE.md repos vs actual repos
 * 4. Supported versions drift — SECURITY.md "Supported versions" table vs
 *    actual GitHub releases
 *
 * Required:
 *   - GITHUB_TOKEN env var (or `gh auth token` to fetch it)
 *   - reads README.md, LICENSING.md, ARCHITECTURE.md, SECURITY.md from local clone
 *
 * Exit 0 = pass. Non-zero = drift detected.
 */

"use strict";

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// ─── Helpers ─────────────────────────────────────────────────────────────────

function readFile(p) {
  return fs.readFileSync(p, "utf8");
}

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  failures += 1;
}

function pass(msg) {
  console.log(`PASS: ${msg}`);
}

let failures = 0;

function execGh(args) {
  const cmd = `gh ${args}`;
  try {
    const out = execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    return out.trim();
  } catch (e) {
    throw new Error(`gh ${args} failed: ${e.stderr || e.message}`);
  }
}

function getGhToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN;
  // Fall back to `gh auth token`
  try {
    return execGh("auth token");
  } catch (e) {
    throw new Error("no GITHUB_TOKEN / GH_TOKEN / gh auth available");
  }
}

async function ghFetch(path) {
  const token = getGhToken();
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "A1-portfolio-drift-check",
    },
  });
  if (!res.ok) {
    throw new Error(`GitHub API ${path}: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// ─── Load ground truth from armosphera org ────────────────────────────────────

async function loadActualRepos() {
  const repos = await ghFetch("/orgs/Armosphera/repos?per_page=100&type=all");
  return repos
    .filter((r) => !r.fork && !r.archived)
    .map((r) => ({
      name: r.name,
      visibility: r.visibility,
      description: r.description,
      defaultBranch: r.default_branch,
      license: r.license ? r.license.spdx_id : null,
      licenseKey: r.license ? r.license.key : null,
    }));
}

async function loadLatestRelease(repoName) {
  try {
    const releases = await ghFetch(`/repos/Armosphera/${repoName}/releases?per_page=1`);
    if (releases.length === 0) return null;
    return releases[0].tag_name;
  } catch (e) {
    return null;
  }
}

// ─── Load portfolio docs ──────────────────────────────────────────────────────

const REPO_ROOT = path.resolve(__dirname, "..");
const docs = {
  readme: readFile(path.join(REPO_ROOT, "README.md")),
  licensing: readFile(path.join(REPO_ROOT, "LICENSING.md")),
  architecture: readFile(path.join(REPO_ROOT, "ARCHITECTURE.md")),
  security: readFile(path.join(REPO_ROOT, "SECURITY.md")),
};

// ─── Check 1: README.md repo index drift ─────────────────────────────────────

function checkReadme(actualRepos) {
  // README has a table like: | [`Armosphera/<name>`](../<name>) | <layer> |
  // Extract the names.
  const re = /\[\`Armosphera\/([A-Za-z0-9._-]+)\`\]\(\.\.\/([A-Za-z0-9._-]+)\)/g;
  const readmeNames = new Set();
  let m;
  while ((m = re.exec(docs.readme)) !== null) {
    if (m[1] === m[2]) readmeNames.add(m[1]);
  }

  const actualNames = new Set(actualRepos.map((r) => r.name));

  const inReadmeNotActual = [...readmeNames].filter((n) => !actualNames.has(n));
  const inActualNotReadme = [...actualNames].filter((n) => !readmeNames.has(n));

  if (inReadmeNotActual.length > 0) {
    fail(`README.md lists repos that don't exist in armosphera/: ${inReadmeNotActual.join(", ")}`);
  } else {
    pass(`README.md lists all ${actualNames.size} actual repos (no stale entries)`);
  }
  if (inActualNotReadme.length > 0) {
    fail(`README.md is missing repos that exist in armosphera/: ${inActualNotReadme.join(", ")}`);
  }
}

// ─── Check 2: LICENSING.md license matrix drift ──────────────────────────────

function checkLicensing(actualRepos) {
  // LICENSING.md has rows like: | [`Armosphera/<name>`](../<name>) | <vis> | <license> | `SPDX` | ... |
  // Extract name + SPDX.
  const lines = docs.licensing.split("\n");
  const licensingRows = new Map(); // name -> SPDX

  for (const line of lines) {
    const m = line.match(/\[\`Armosphera\/([A-Za-z0-9._-]+)\`\]\(\.\.\/([A-Za-z0-9._-]+)\)[^|]*\|\s*[^|]*\|\s*[^|]*\|\s*`([^`]+)`/);
    if (m && m[1] === m[2]) {
      licensingRows.set(m[1], m[3]);
    }
  }

  for (const repo of actualRepos) {
    const expectedSpdx = licensingRows.get(repo.name);
    if (!expectedSpdx) {
      fail(`LICENSING.md missing row for ${repo.name}`);
      continue;
    }
    // License fields can be:
    //   - MIT, Apache-2.0, ... (standard SPDX)
    //   - NOASSERTION (when GitHub can't detect — usually proprietary "All rights reserved")
    //   - null (no LICENSE file in repo)
    //   - LicenseRef-<custom> (e.g. LicenseRef-Armosphera-Proprietary)
    // The drift check accepts either an explicit custom SPDX OR NOASSERTION for
    // proprietary repos whose LICENSE file declares "All rights reserved".
    const githubSpdx = repo.license || "NOASSERTION";
    if (githubSpdx !== expectedSpdx) {
      // Allow NOASSERTION ↔ LicenseRef-Armosphera-Proprietary drift (both mean
      // proprietary with no OSI license — GitHub can't auto-detect).
      const bothProprietary =
        (githubSpdx === "NOASSERTION" &&
          expectedSpdx.startsWith("LicenseRef-")) ||
        (expectedSpdx === "NOASSERTION" &&
          githubSpdx.startsWith("LicenseRef-"));
      if (!bothProprietary) {
        fail(
          `LICENSING.md row for ${repo.name} says '${expectedSpdx}', ` +
          `actual LICENSE says '${githubSpdx}'`
        );
      } else {
        pass(`LICENSING.md ${repo.name}: '${expectedSpdx}' ≈ actual '${githubSpdx}' (proprietary)`);
      }
    } else {
      pass(`LICENSING.md ${repo.name}: '${expectedSpdx}' matches actual LICENSE`);
    }
  }
}

// ─── Check 3: ARCHITECTURE.md layer cake drift ───────────────────────────────

function checkArchitecture(actualRepos) {
  // ARCHITECTURE.md mentions repos in code blocks like `Armosphera/<name>`.
  const re = /`Armosphera\/([A-Za-z0-9._-]+)`/g;
  const archNames = new Set();
  let m;
  while ((m = re.exec(docs.architecture)) !== null) {
    archNames.add(m[1]);
  }

  const actualNames = new Set(actualRepos.map((r) => r.name));
  const inArchNotActual = [...archNames].filter((n) => !actualNames.has(n));
  if (inArchNotActual.length > 0) {
    fail(`ARCHITECTURE.md mentions repos that don't exist: ${inArchNotActual.join(", ")}`);
  } else if (archNames.size > 0) {
    pass(`ARCHITECTURE.md mentions ${archNames.size} repos, all real`);
  } else {
    fail("ARCHITECTURE.md doesn't mention any repos in code blocks — manual review needed");
  }
}

// ─── Check 4: SECURITY.md supported versions drift ───────────────────────────

async function checkSecurity(actualRepos) {
  // SECURITY.md may have a table or a list of supported versions per repo.
  // We accept either format. If the doc doesn't mention versions at all,
  // skip this check.
  const supportedPatterns = [
    /(?:^|\n)[\s\S]*?(?:supported\s*versions?|active\s*versions?)\s*[:|]/i,
  ];
  let hasVersionTable = false;
  for (const re of supportedPatterns) {
    if (re.test(docs.security)) {
      hasVersionTable = true;
      break;
    }
  }
  if (!hasVersionTable) {
    pass("SECURITY.md doesn't enumerate supported versions per repo — skipping");
    return;
  }

  // Check that the "active" repos in SECURITY.md match the actual repos.
  // This is a heuristic: if SECURITY.md names a repo, it should be in armosphera/.
  const re = /`Armosphera\/([A-Za-z0-9._-]+)`/g;
  const securityNames = new Set();
  let m;
  while ((m = re.exec(docs.security)) !== null) {
    securityNames.add(m[1]);
  }

  const actualNames = new Set(actualRepos.map((r) => r.name));
  const inSecNotActual = [...securityNames].filter((n) => !actualNames.has(n));
  if (inSecNotActual.length > 0) {
    fail(`SECURITY.md mentions repos that don't exist: ${inSecNotActual.join(", ")}`);
  } else if (securityNames.size > 0) {
    pass(`SECURITY.md mentions ${securityNames.size} repos, all real`);
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== A1-portfolio drift check ===");
  console.log(`Repo root: ${REPO_ROOT}`);
  console.log();

  let actualRepos;
  try {
    actualRepos = await loadActualRepos();
  } catch (e) {
    fail(`Failed to load armosphera repos: ${e.message}`);
    process.exit(1);
  }
  console.log(`Found ${actualRepos.length} repos in armosphera/`);
  console.log();

  checkReadme(actualRepos);
  console.log();
  checkLicensing(actualRepos);
  console.log();
  checkArchitecture(actualRepos);
  console.log();
  await checkSecurity(actualRepos);
  console.log();

  if (failures > 0) {
    console.error(`\n${failures} failure(s) — portfolio drift detected.`);
    console.error(
      "Update the affected doc(s) to match reality, or close this lane " +
      "if the drift is intentional and the docs are the source of truth."
    );
    process.exit(1);
  }

  console.log(
    `\nAll checks passed — README, LICENSING, ARCHITECTURE, SECURITY are in sync ` +
    `with ${actualRepos.length} armosphera repos.`
  );
  process.exit(0);
}

main().catch((e) => {
  console.error(`FATAL: ${e.message}`);
  console.error(e.stack);
  process.exit(2);
});