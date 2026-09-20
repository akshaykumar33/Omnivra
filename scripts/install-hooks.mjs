#!/usr/bin/env node
/**
 * Points git at the versioned .githooks/ directory.
 *
 * Runs automatically from the `prepare` npm script, so a fresh clone is
 * protected as soon as anyone runs `pnpm install`. Also safe to run directly:
 *   node scripts/install-hooks.mjs
 *
 * We set core.hooksPath rather than depending on husky: the hooks must work in
 * a clone that has never installed node_modules, and a devDependency cannot.
 */

import { execFileSync } from "node:child_process";
import { chmodSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const HOOKS_DIR = ".githooks";

function isGitRepo() {
  try {
    execFileSync("git", ["rev-parse", "--git-dir"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function main() {
  // CI checks out a detached tree and runs the gate explicitly; hooks add nothing there.
  if (process.env.CI) {
    console.log(
      "install-hooks: CI detected, skipping (checks run as explicit workflow steps).",
    );
    return;
  }
  if (!isGitRepo()) {
    console.log("install-hooks: not a git repository, skipping.");
    return;
  }
  if (!existsSync(HOOKS_DIR)) {
    console.error(
      `install-hooks: ${HOOKS_DIR}/ is missing — cannot install hooks.`,
    );
    process.exitCode = 1;
    return;
  }

  execFileSync("git", ["config", "core.hooksPath", HOOKS_DIR], {
    stdio: "inherit",
  });

  // Git requires the executable bit on POSIX; harmless to attempt on Windows.
  if (process.platform !== "win32") {
    for (const entry of readdirSync(HOOKS_DIR)) {
      if (entry.startsWith(".")) continue;
      try {
        chmodSync(join(HOOKS_DIR, entry), 0o755);
      } catch {
        // Non-fatal: the hook still runs if the filesystem ignores mode bits.
      }
    }
  }

  console.log(`install-hooks: core.hooksPath -> ${HOOKS_DIR}`);
  console.log(
    "install-hooks: pre-commit, commit-msg and pre-push are now active.",
  );
}

main();
