#!/usr/bin/env node
/**
 * Validates the current branch name against the Omnivra branching protocol.
 * See docs/development/branching.md.
 *
 * Usage: check-branch-name.mjs [branch-name]
 *        (defaults to the current branch)
 */

import { currentBranch } from "./lib/git.mjs";
import { failure, success, hint } from "./lib/report.mjs";

export const TYPES = [
  "feat",
  "fix",
  "refactor",
  "docs",
  "test",
  "perf",
  "security",
  "chore",
  "ci",
  "build",
  "release",
  "revert",
];

/** Branches that are managed by the project rather than by a contributor. */
const PROTECTED = new Set(["main", "develop"]);

/** Tool-generated branches we do not control the naming of. */
const EXEMPT = [
  /^dependabot\//,
  /^renovate\//,
  /^changeset-release\//,
  /^gh-readonly-queue\//,
  /^revert-\d+-/,
];

const MAX_LENGTH = 70;

export function validateBranchName(name) {
  if (!name || name === "HEAD") {
    return {
      ok: false,
      reason: "Detached HEAD — check out a named branch before working.",
    };
  }
  if (PROTECTED.has(name)) {
    return {
      ok: false,
      reason: `"${name}" is a protected branch. Work never happens directly on it.`,
    };
  }
  if (EXEMPT.some((pattern) => pattern.test(name))) {
    return { ok: true, exempt: true };
  }
  if (name.length > MAX_LENGTH) {
    return {
      ok: false,
      reason: `Branch name is ${name.length} chars; keep it under ${MAX_LENGTH}.`,
    };
  }

  const slash = name.indexOf("/");
  if (slash === -1) {
    return { ok: false, reason: 'Missing the "<type>/" prefix.' };
  }

  const type = name.slice(0, slash);
  const rest = name.slice(slash + 1);

  if (!TYPES.includes(type)) {
    return { ok: false, reason: `Unknown type "${type}".` };
  }
  if (rest.length === 0) {
    return { ok: false, reason: "Nothing after the type prefix." };
  }

  // release/ branches carry versions, so dots are allowed there and nowhere else.
  const pattern =
    type === "release"
      ? /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/
      : /^[a-z0-9]+(?:-[a-z0-9]+)+$/;

  if (!pattern.test(rest)) {
    if (/[A-Z]/.test(rest)) {
      return { ok: false, reason: "Use lowercase only." };
    }
    if (type !== "release" && !rest.includes("-")) {
      return {
        ok: false,
        reason:
          'Needs at least "<scope>-<description>" — two hyphen-separated words minimum.',
      };
    }
    return {
      ok: false,
      reason: "Use lowercase words separated by single hyphens.",
    };
  }

  return { ok: true };
}

function main() {
  const name = process.argv[2] ?? currentBranch();
  const result = validateBranchName(name);

  if (result.ok) {
    success(
      `Branch name: ${name}${result.exempt ? " (tool-managed, exempt)" : ""}`,
    );
    process.exit(0);
  }

  failure(`Invalid branch name: ${name}`, [result.reason]);
  hint([
    "Format:  <type>/<scope>-<short-description>",
    `Types:   ${TYPES.join(", ")}`,
    "",
    "Examples:",
    "  feat/rule-engine-compound-triggers",
    "  fix/browser-duplicate-content-script",
    "  security/desktop-validate-native-messaging-origin",
    "  chore/deps-update-workspace",
    "",
    "Rename the current branch with:",
    "  git branch -m <new-name>",
    "",
    "See docs/development/branching.md.",
  ]);
  process.exit(1);
}

if (
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith("check-branch-name.mjs")
) {
  main();
}
