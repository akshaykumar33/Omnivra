#!/usr/bin/env node
/**
 * Code-hygiene gate: catches the things that pass typecheck and lint locally
 * but quietly disable CI signal or leak debug output into shipped surfaces.
 *
 * Usage: check-forbidden-patterns.mjs [--staged | --all]
 */

import { readFileSync } from 'node:fs';
import { stagedFiles, stagedContent, trackedFiles, isBinary } from './lib/git.mjs';
import { reportFindings, warning } from './lib/report.mjs';

const SOURCE = /\.(ts|tsx|js|jsx|mjs|cjs|svelte|vue)$/;
const TEST = /(\.(test|spec)\.[tj]sx?$)|(^|\/)(tests?|__tests__|e2e)\//;
const TOOLING = /^(scripts|ci)\//;

/**
 * The logger package is the one place console.* is correct — it is the sink
 * every other package routes through. Exempting it is the point of the rule,
 * not a hole in it.
 */
const LOG_SINK = /^packages\/logger\//;

/**
 * Files that contain these patterns as fixtures rather than as code. The gate's
 * own self-test has to embed a `debugger` and a `.only` to prove it catches them.
 */
const EXCLUDED = [/^scripts\/selftest-protection\.mjs$/, /^scripts\/check-forbidden-patterns\.mjs$/];

function isExcluded(file) {
  return EXCLUDED.some((pattern) => pattern.test(file));
}

/** Line-level escape hatch, consistent with the secret scanner. */
const INLINE_ALLOW = /(?:hygiene:allow|eslint-disable)/;

const RULES = [
  {
    id: 'focused-test',
    pattern: /(?:^|[^\w.])(?:describe|it|test|context|suite)\.only\s*\(|(?:^|[^\w.])(?:fdescribe|fit)\s*\(/,
    message: 'Focused test — this silently disables every other test in the file.',
    fix: 'Remove .only / fdescribe / fit before committing.',
    applies: (file) => SOURCE.test(file),
  },
  {
    id: 'skipped-test',
    pattern: /(?:^|[^\w.])(?:describe|it|test)\.skip\s*\(|(?:^|[^\w.])(?:xdescribe|xit)\s*\(/,
    message: 'Skipped test without a tracking issue.',
    fix: 'Either fix it, delete it, or add "// hygiene:allow — see #<issue>" on the line.',
    applies: (file) => SOURCE.test(file),
  },
  {
    id: 'debugger',
    pattern: /(?:^|[^\w.])debugger\s*;?/,
    message: 'Leftover `debugger` statement.',
    fix: 'Remove it.',
    applies: (file) => SOURCE.test(file),
  },
  {
    id: 'console-in-source',
    pattern: /(?:^|[^\w.])console\.(log|debug|dir|trace)\s*\(/,
    message: 'console.* in shipped source.',
    fix: 'Route through the @omnivra/logger package so output has one sink that can enforce redaction.',
    applies: (file) =>
      SOURCE.test(file) &&
      !TEST.test(file) &&
      !TOOLING.test(file) &&
      !LOG_SINK.test(file) &&
      /(^|\/)src\//.test(file),
  },
  {
    id: 'ts-suppression',
    pattern: /@ts-(ignore|nocheck)\b/,
    message: 'TypeScript diagnostic suppressed.',
    fix: 'Fix the type, or use @ts-expect-error with a comment explaining why it is expected.',
    applies: (file) => SOURCE.test(file),
  },
];

/** Non-blocking: surfaced so reviewers see it, but never stops a commit. */
const ADVISORY = [
  {
    id: 'unexplained-todo',
    pattern: /(?:\/\/|\/\*|#|\*)\s*(TODO|FIXME|HACK|XXX)\b(?!\s*[([:]\s*(?:#\d+|[A-Za-z]))/,
    message: 'TODO/FIXME with no owner or issue reference.',
    // Source only: prose that discusses TODOs is not a TODO.
    applies: (file) => SOURCE.test(file),
  },
];

function collect() {
  const all = process.argv.includes('--all');
  const files = all ? trackedFiles() : stagedFiles();
  const read = all
    ? (file) => {
        try {
          return readFileSync(file);
        } catch {
          return Buffer.alloc(0);
        }
      }
    : stagedContent;

  const units = [];
  for (const file of files) {
    const normalized = file.replace(/\\/g, '/');
    if (isExcluded(normalized)) continue;
    const buffer = read(file);
    if (buffer.length === 0 || isBinary(buffer)) continue;
    const lines = buffer.toString('utf8').split(/\r?\n/);
    for (const [index, text] of lines.entries()) {
      units.push({ file: normalized, line: index + 1, text });
    }
  }
  return units;
}

function main() {
  const units = collect();
  const findings = [];
  const advisories = [];

  for (const unit of units) {
    if (INLINE_ALLOW.test(unit.text)) continue;

    for (const rule of RULES) {
      if (!rule.applies(unit.file)) continue;
      if (rule.pattern.test(unit.text)) {
        findings.push({
          file: unit.file,
          line: unit.line,
          message: `${rule.message} [${rule.id}]`,
          detail: rule.fix,
        });
      }
    }

    for (const rule of ADVISORY) {
      if (!rule.applies(unit.file)) continue;
      if (rule.pattern.test(unit.text)) {
        advisories.push(`${unit.file}:${unit.line} — ${rule.message}`);
      }
    }
  }

  if (advisories.length) {
    warning(`Code hygiene: ${advisories.length} advisory note(s) (not blocking)`, advisories.slice(0, 20));
    if (advisories.length > 20) {
      warning(`…and ${advisories.length - 20} more.`);
    }
  }

  const code = reportFindings({
    name: 'Code hygiene',
    findings,
    remediation: [
      'These block because they degrade CI signal or leak debug output to users.',
      'To knowingly keep one, append an inline `hygiene:allow` comment with a reason.',
    ],
  });
  process.exit(code);
}

main();
