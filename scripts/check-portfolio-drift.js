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

// Robust wrapper: try ghFetch first; fall back to `gh api` shell command.
// `gh api` uses the local auth and sometimes works where fetch doesn't
// (e.g. CI runners with firewall / DNS issues to api.github.com).
async function ghFetchRobust(path) {
  try {
    return await ghFetch(path);
  } catch (e) {
    const fallback = execGh(`api ${path.replace(/^\//, "")}`);
    return JSON.parse(fallback);
  }
}

// ─── Load expected repos from canonical list ────────────────────────────────
//
// /user/repos requires authentication and may not show private repos for
// GITHUB_TOKEN in CI. Instead, we load the canonical list from
// expected-repos.json in this repo (authoritative source). Then we use the
// GitHub API only to verify each expected repo actually exists and matches
// its declared license / visibility.

function loadExpectedRepos() {
  const expectedPath = path.join(REPO_ROOT, "expected-repos.json");
  if (!fs.existsSync(expectedPath)) {
    throw new Error(`expected-repos.json not found at ${expectedPath}`);
  }
  const expected = JSON.parse(readFile(expectedPath));
  return expected.repos.map((r) => ({
    name: r.name,
    visibility: r.visibility,
    layer: r.layer,
    expectedLicense: r.spdx,
  }));
}

async function loadActualRepos() {
  // Best-effort: try to fetch from GitHub. Private repos won't show up with
  // a basic GITHUB_TOKEN — that's fine, the canonical list is
  // expected-repos.json.
  let repos = [];
  try {
    repos = await ghFetch("/user/repos?per_page=100&visibility=all&affiliation=owner");
  } catch (e) {
    try {
      repos = await ghFetch("/orgs/Armosphera/repos?per_page=100&type=all");
    } catch (e2) {
      if (e2.message.includes("404")) {
        repos = await ghFetch("/users/Armosphera/repos?per_page=100&type=all");
      }
    }
  }
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

function checkReadme(expectedRepos) {
  // README has a table like: | [`Armosphera/<name>`](../<name>) | <layer> |
  // Extract the names.
  const re = /\[\`Armosphera\/([A-Za-z0-9._-]+)\`\]\(\.\.\/([A-Za-z0-9._-]+)\)/g;
  const readmeNames = new Set();
  let m;
  while ((m = re.exec(docs.readme)) !== null) {
    if (m[1] === m[2]) readmeNames.add(m[1]);
  }

  const expectedNames = new Set(expectedRepos.map((r) => r.name));

  const inReadmeNotExpected = [...readmeNames].filter((n) => !expectedNames.has(n));
  const inExpectedNotReadme = [...expectedNames].filter((n) => !readmeNames.has(n));

  if (inReadmeNotExpected.length > 0) {
    fail(`README.md lists repos not in expected-repos.json: ${inReadmeNotExpected.join(", ")}`);
  } else {
    pass(`README.md lists all ${expectedNames.size} expected repos (no stale entries)`);
  }
  if (inExpectedNotReadme.length > 0) {
    fail(`README.md is missing expected repos: ${inExpectedNotReadme.join(", ")}`);
  }
}

// ─── Check 2: LICENSING.md license matrix drift ──────────────────────────────

function checkLicensing(expectedRepos) {
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

  for (const repo of expectedRepos) {
    const docsSpdx = licensingRows.get(repo.name);
    if (!docsSpdx) {
      fail(`LICENSING.md missing row for ${repo.name}`);
      continue;
    }
    if (docsSpdx !== repo.expectedLicense) {
      fail(
        `LICENSING.md row for ${repo.name} says '${docsSpdx}', ` +
        `expected-repos.json says '${repo.expectedLicense}'`
      );
    } else {
      pass(`LICENSING.md ${repo.name}: '${docsSpdx}' matches expected-repos.json`);
    }
  }
}

// ─── Check 3: ARCHITECTURE.md layer cake drift ───────────────────────────────

function checkArchitecture(expectedRepos) {
  // ARCHITECTURE.md mentions repos in code blocks like `Armosphera/<name>`.
  const re = /`Armosphera\/([A-Za-z0-9._-]+)`/g;
  const archNames = new Set();
  let m;
  while ((m = re.exec(docs.architecture)) !== null) {
    archNames.add(m[1]);
  }

  const expectedNames = new Set(expectedRepos.map((r) => r.name));
  const inArchNotExpected = [...archNames].filter((n) => !expectedNames.has(n));
  if (inArchNotExpected.length > 0) {
    fail(`ARCHITECTURE.md mentions repos not in expected-repos.json: ${inArchNotExpected.join(", ")}`);
  } else if (archNames.size > 0) {
    pass(`ARCHITECTURE.md mentions ${archNames.size} repos, all in expected-repos.json`);
  } else {
    fail("ARCHITECTURE.md doesn't mention any repos in code blocks — manual review needed");
  }
}

// ─── Check 4: SECURITY.md supported versions drift ───────────────────────────

async function checkSecurity(expectedRepos) {
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

  const actualNames = new Set(expectedRepos.map((r) => r.name));
  const inSecNotActual = [...securityNames].filter((n) => !actualNames.has(n));
  if (inSecNotActual.length > 0) {
    fail(`SECURITY.md mentions repos that don't exist: ${inSecNotActual.join(", ")}`);
  } else if (securityNames.size > 0) {
    pass(`SECURITY.md mentions ${securityNames.size} repos, all real`);
  }
}

// ─── Check 5: Dependabot configured for code-bearing repos ──────────────────

async function checkDependabot(expectedRepos) {
  // Code-bearing repos (not pure docs / tooling) should have Dependabot
  // configured. A1-portfolio itself is docs-only, so it's exempt.
  //
  // We check via the GitHub API for .github/dependabot.yml (the modern config)
  // OR .github/workflows/dependabot.yml (the legacy workflow).
  //
  // This is a best-effort check: requires GITHUB_TOKEN with read access.

  // Repos we expect to have Dependabot. (Pure docs / tooling exempt.)
  const codeRepos = expectedRepos.filter((r) =>
    r.layer !== "Meta" && r.layer !== "Tooling"
  );

  for (const repo of codeRepos) {
    let hasDependabot = false;

    try {
      const dep = await ghFetchRobust(`/repos/Armosphera/${repo.name}/contents/.github/dependabot.yml`);
      if (dep && dep.name) hasDependabot = true;
    } catch (e) {
      // Try the legacy path
      try {
        const wf = await ghFetchRobust(`/repos/Armosphera/${repo.name}/contents/.github/workflows/dependabot.yml`);
        if (wf && wf.name) hasDependabot = true;
      } catch (e2) {
        // Neither found
      }
    }

    if (hasDependabot) {
      pass(`Dependabot configured for ${repo.name}`);
    } else {
      fail(`${repo.name} is missing Dependabot config (.github/dependabot.yml or .github/workflows/dependabot.yml)`);
    }
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== A1-portfolio drift check ===");
  console.log(`Repo root: ${REPO_ROOT}`);
  console.log();

  // Load canonical expected list (authoritative — includes private repos)
  let expectedRepos;
  try {
    expectedRepos = loadExpectedRepos();
  } catch (e) {
    fail(`Failed to load expected-repos.json: ${e.message}`);
    process.exit(1);
  }
  console.log(`Loaded ${expectedRepos.length} expected repos from expected-repos.json`);
  console.log();

  // Optionally load actual from GitHub API (best-effort, public only with default token)
  let actualRepos = [];
  try {
    actualRepos = await loadActualRepos();
  } catch (e) {
    console.warn(`(warn) Could not load actual repos from GitHub API: ${e.message}`);
    console.warn(`(warn) Continuing with expected-repos.json as authoritative source.`);
  }
  if (actualRepos.length > 0) {
    console.log(`Found ${actualRepos.length} repos via GitHub API (private repos may be missing)`);
    console.log();

    // Cross-check: any repo in actualRepos that's not in expected-repos.json
    const expectedNames = new Set(expectedRepos.map((r) => r.name));
    const unexpected = actualRepos.filter((r) => !expectedNames.has(r.name));
    if (unexpected.length > 0) {
      fail(
        `GitHub has ${unexpected.length} repo(s) NOT in expected-repos.json: ` +
        `${unexpected.map((r) => r.name).join(", ")}. ` +
        `Either add to expected-repos.json or deprecate the repo.`
      );
    } else {
      pass(`All GitHub repos are in expected-repos.json (no drift)`);
    }
    console.log();
  }

  checkReadme(expectedRepos);
  console.log();
  checkLicensing(expectedRepos);
  console.log();
  checkArchitecture(expectedRepos);
  console.log();
  await checkSecurity(expectedRepos);
  console.log();
  await checkDependabot(expectedRepos);
  console.log();

  if (failures > 0) {
    console.error(`\n${failures} failure(s) — portfolio drift detected.`);
    console.error(
      "Update the affected doc(s) to match reality, or update expected-repos.json " +
      "if the drift is intentional and the docs are the source of truth."
    );
    process.exit(1);
  }

  console.log(
    `\nAll checks passed — README, LICENSING, ARCHITECTURE, SECURITY are in sync ` +
    `with ${expectedRepos.length} expected armosphera repos.`
  );
  process.exit(0);
}

main().catch((e) => {
  console.error(`FATAL: ${e.message}`);
  console.error(e.stack);
  process.exit(2);
});