/**
 * Minimal git helpers shared by the protection-gate scripts.
 *
 * Zero dependencies on purpose: these run from git hooks in a fresh clone,
 * before `pnpm install` has ever been executed. See docs/development/commit-hooks.md.
 */

import { execFileSync } from "node:child_process";

/** Run a git command and return trimmed stdout. Throws on non-zero exit. */
export function git(args, { allowFailure = false } = {}) {
  try {
    return execFileSync("git", args, {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch (error) {
    if (allowFailure) return "";
    throw error;
  }
}

/** Run git and return raw Buffer stdout (for binary-safe blob reads). */
export function gitBuffer(args, { allowFailure = false } = {}) {
  try {
    return execFileSync("git", args, {
      maxBuffer: 64 * 1024 * 1024,
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    if (allowFailure) return Buffer.alloc(0);
    throw error;
  }
}

/** Repository root as an absolute path. */
export function repoRoot() {
  return git(["rev-parse", "--show-toplevel"]);
}

/**
 * Files staged for commit, limited to Added/Copied/Modified/Renamed.
 * Deletions are excluded — there is nothing left to scan.
 */
export function stagedFiles() {
  const out = git(["diff", "--cached", "--name-only", "--diff-filter=ACMR"]);
  return out ? out.split("\n").filter(Boolean) : [];
}

/** Every tracked file in the working tree. */
export function trackedFiles() {
  const out = git(["ls-files"]);
  return out ? out.split("\n").filter(Boolean) : [];
}

/** File content as it exists in the index (what would actually be committed). */
export function stagedContent(file) {
  return gitBuffer(["show", `:${file}`], { allowFailure: true });
}

/** File content from the working tree at HEAD-or-later, by path. */
export function workingContent(file) {
  return gitBuffer(["show", `HEAD:${file}`], { allowFailure: true });
}

/** Byte size of a staged blob, without materialising it. */
export function stagedSize(file) {
  const out = git(["cat-file", "-s", `:${file}`], { allowFailure: true });
  const size = Number.parseInt(out, 10);
  return Number.isFinite(size) ? size : 0;
}

/** Current branch name, or empty string on a detached HEAD. */
export function currentBranch() {
  return git(["rev-parse", "--abbrev-ref", "HEAD"], { allowFailure: true });
}

/** True when the buffer looks like binary content (NUL byte in the first 8KB). */
export function isBinary(buffer) {
  const window = buffer.subarray(0, 8192);
  return window.includes(0);
}

/** Commits unique to `range`, used by the pre-push full-branch scan. */
export function commitsInRange(range) {
  const out = git(["rev-list", range], { allowFailure: true });
  return out ? out.split("\n").filter(Boolean) : [];
}

/** All files touched by any commit in the range. */
export function filesChangedInRange(range) {
  const out = git(["diff", "--name-only", "--diff-filter=ACMR", range], {
    allowFailure: true,
  });
  return out ? [...new Set(out.split("\n").filter(Boolean))] : [];
}
