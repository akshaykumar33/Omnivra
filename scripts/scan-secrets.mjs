#!/usr/bin/env node
/**
 * Omnivra secret scanner.
 *
 * Modes:
 *   --staged            scan the staged index      (pre-commit)
 *   --range <a>..<b>    scan lines added in range  (pre-push)
 *   --all               scan every tracked file    (CI)
 *
 * Exit code 1 on any finding. Zero dependencies — see docs/development/commit-hooks.md.
 *
 * This is the first line of defence, not the only one: CI re-runs it over the
 * full tree and GitHub push protection backstops it server-side. A secret that
 * reaches a remote is compromised — rotate it, then clean history.
 */

import { readFileSync } from 'node:fs';
import {
  stagedFiles,
  stagedContent,
  trackedFiles,
  filesChangedInRange,
  git,
  isBinary,
} from './lib/git.mjs';
import { RULES, isExcludedPath, isPlaceholder, entropy, INLINE_ALLOW } from './lib/secret-rules.mjs';
import { reportFindings, dim } from './lib/report.mjs';

const MAX_LINE_LENGTH = 4000; // minified/base64 blobs produce noise, not signal

/** @typedef {{ file: string, line: number, text: string }} Unit */

function unitsFromBuffer(file, buffer) {
  if (buffer.length === 0 || isBinary(buffer)) return [];
  return buffer
    .toString('utf8')
    .split(/\r?\n/)
    .map((text, index) => ({ file, line: index + 1, text }));
}

function collectStaged() {
  /** @type {Unit[]} */
  const units = [];
  for (const file of stagedFiles()) {
    if (isExcludedPath(file)) continue;
    units.push(...unitsFromBuffer(file, stagedContent(file)));
  }
  return units;
}

function collectAll() {
  /** @type {Unit[]} */
  const units = [];
  for (const file of trackedFiles()) {
    if (isExcludedPath(file)) continue;
    let buffer;
    try {
      buffer = readFileSync(file);
    } catch {
      continue; // deleted or unreadable in the working tree
    }
    units.push(...unitsFromBuffer(file, buffer));
  }
  return units;
}

/**
 * Scan only lines *added* across a commit range. This is what catches a secret
 * introduced in an earlier local commit on the branch and removed later — the
 * staged scan cannot see it, but it is still in the history about to be pushed.
 */
function collectRange(range) {
  const diff = git(['diff', '--unified=0', '--no-color', range], { allowFailure: true });
  if (!diff) return [];

  /** @type {Unit[]} */
  const units = [];
  let file = '';
  let lineNumber = 0;
  let excluded = false;

  for (const raw of diff.split(/\r?\n/)) {
    if (raw.startsWith('+++ ')) {
      file = raw.slice(4).replace(/^b\//, '');
      excluded = file === '/dev/null' || isExcludedPath(file);
      continue;
    }
    const hunk = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(raw);
    if (hunk) {
      lineNumber = Number.parseInt(hunk[1], 10);
      continue;
    }
    if (excluded || !file) continue;
    if (raw.startsWith('+') && !raw.startsWith('+++')) {
      units.push({ file, line: lineNumber, text: raw.slice(1) });
      lineNumber += 1;
    }
  }
  return units;
}

function scan(units) {
  const findings = [];
  const seen = new Set();

  for (const unit of units) {
    if (unit.text.length > MAX_LINE_LENGTH) continue;
    if (INLINE_ALLOW.test(unit.text)) continue;

    for (const rule of RULES) {
      rule.pattern.lastIndex = 0;
      let match;
      while ((match = rule.pattern.exec(unit.text)) !== null) {
        const captureIndex = rule.capture ?? 0;
        const value = match[captureIndex] ?? match[0];

        if (rule.allowPlaceholder !== false && isPlaceholder(value)) continue;
        if (rule.minEntropy && entropy(value) < rule.minEntropy) continue;

        const key = `${unit.file}:${unit.line}:${rule.id}`;
        if (seen.has(key)) continue;
        seen.add(key);

        findings.push({
          file: unit.file,
          line: unit.line,
          message: `${rule.description} [${rule.id}]`,
          detail: `${preview(match[0])} — ${rule.rotate}`,
        });
      }
    }
  }
  return findings;
}

/** Show enough to identify the hit without reprinting the whole credential. */
function preview(match) {
  const collapsed = match.replace(/\s+/g, ' ').trim();
  if (collapsed.length <= 24) return `match: ${collapsed}`;
  return `match: ${collapsed.slice(0, 12)}…${collapsed.slice(-4)} (${collapsed.length} chars)`;
}

function main() {
  const args = process.argv.slice(2);
  let units;
  let scope;

  if (args.includes('--all')) {
    scope = 'all tracked files';
    units = collectAll();
  } else if (args.includes('--range')) {
    const range = args[args.indexOf('--range') + 1];
    if (!range) {
      console.error('scan-secrets: --range requires a revision range, e.g. origin/main..HEAD');
      process.exit(2);
    }
    scope = `lines added in ${range}`;
    units = collectRange(range);
  } else {
    scope = 'staged changes';
    units = collectStaged();
  }

  const findings = scan(units);
  console.error(dim(`  scanned ${units.length} line(s) across ${scope}`));

  const code = reportFindings({
    name: 'Secret scan',
    findings,
    remediation: [
      'A committed secret is compromised even if you rewrite history.',
      '1. ROTATE the credential now — this is the actual fix.',
      '2. Remove it from the diff and move it to the environment or a secret manager.',
      '3. Add the key to .env.example with an empty placeholder value.',
      '',
      'If this is a documented non-secret (fixture, doc example), append an inline',
      '`secret-scan:allow` comment on that line and say why in the PR description.',
      'See docs/security/secret-management.md.',
    ],
  });
  process.exit(code);
}

main();
