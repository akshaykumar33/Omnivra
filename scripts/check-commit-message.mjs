#!/usr/bin/env node
/**
 * Conventional Commits validator.
 *
 * Deliberately not commitlint: this has to run from a git hook in a fresh clone
 * with no node_modules. Same ruleset, zero install. See docs/development/commit-hooks.md.
 *
 * Usage: check-commit-message.mjs <path-to-COMMIT_EDITMSG>
 *        check-commit-message.mjs --message "feat(core): do the thing"
 */

import { readFileSync } from 'node:fs';
import { failure, success, warning, hint } from './lib/report.mjs';

export const TYPES = [
  'feat',
  'fix',
  'docs',
  'style',
  'refactor',
  'perf',
  'test',
  'build',
  'ci',
  'chore',
  'revert',
  'security',
];

const MAX_HEADER = 72;
const MAX_BODY_LINE = 100;

/** Git-generated or in-progress messages we must not reject. */
const BYPASS = [/^Merge /, /^Revert /, /^fixup! /, /^squash! /, /^Reapply /];

export function validateCommitMessage(raw) {
  const errors = [];
  const warnings = [];

  const lines = raw
    .split(/\r?\n/)
    .filter((line) => !line.startsWith('#'))
    .join('\n')
    .trim()
    .split(/\r?\n/);

  const header = lines[0] ?? '';

  if (header.trim().length === 0) {
    return { errors: ['Commit message is empty.'], warnings: [] };
  }
  if (BYPASS.some((pattern) => pattern.test(header))) {
    return { errors: [], warnings: [], bypassed: true };
  }

  const match = /^([a-z]+)(?:\(([^)]+)\))?(!)?: (.+)$/.exec(header);

  if (!match) {
    errors.push('Header does not match "<type>(<scope>): <subject>".');
    if (/^[A-Z][a-z]+:/.test(header)) {
      errors.push('Type must be lowercase.');
    }
    if (!header.includes(':')) {
      errors.push('Missing the ":" separator after the type/scope.');
    }
    return { errors, warnings };
  }

  const [, type, scope, breaking, subject] = match;

  if (!TYPES.includes(type)) {
    errors.push(`Unknown type "${type}". Allowed: ${TYPES.join(', ')}.`);
  }
  if (scope !== undefined && !/^[a-z0-9]+(?:[-/][a-z0-9]+)*$/.test(scope)) {
    errors.push(`Scope "${scope}" must be lowercase, hyphen- or slash-separated.`);
  }
  if (header.length > MAX_HEADER) {
    errors.push(`Header is ${header.length} chars; the limit is ${MAX_HEADER}.`);
  }
  if (subject.endsWith('.')) {
    errors.push('Subject must not end with a period.');
  }
  if (subject.length < 6) {
    errors.push('Subject is too short to describe the change.');
  }
  if (/^[A-Z][a-z]/.test(subject)) {
    warnings.push('Subject usually reads better lowercase and in the imperative mood.');
  }
  if (/^(update|change|fix|misc|stuff|things|wip)s?$/i.test(subject.trim())) {
    errors.push(`"${subject}" says nothing. Describe what changed and why it matters.`);
  }

  // Blank line must separate header from body.
  if (lines.length > 1 && lines[1].trim() !== '') {
    errors.push('Leave a blank line between the header and the body.');
  }

  const body = lines.slice(2);
  for (const [index, line] of body.entries()) {
    if (line.length > MAX_BODY_LINE && !/^\s*(https?:\/\/|\S+@)/.test(line)) {
      warnings.push(`Body line ${index + 3} is ${line.length} chars; wrap at ${MAX_BODY_LINE}.`);
    }
  }

  const hasBreakingFooter = body.some((line) => /^BREAKING[ -]CHANGE:/.test(line));
  if (breaking && !hasBreakingFooter) {
    warnings.push('"!" marks a breaking change — add a "BREAKING CHANGE:" footer explaining it.');
  }

  return { errors, warnings };
}

function main() {
  const args = process.argv.slice(2);
  let raw;

  if (args[0] === '--message') {
    raw = args.slice(1).join(' ');
  } else if (args[0]) {
    raw = readFileSync(args[0], 'utf8');
  } else {
    console.error('check-commit-message: expected a message file path or --message <text>');
    process.exit(2);
  }

  const { errors, warnings, bypassed } = validateCommitMessage(raw);

  for (const w of warnings) warning(w);

  if (errors.length === 0) {
    success(bypassed ? 'Commit message: git-generated, skipped' : 'Commit message: valid');
    process.exit(0);
  }

  failure('Invalid commit message', errors);
  hint([
    'Format:  <type>(<scope>): <subject>',
    `Types:   ${TYPES.join(', ')}`,
    '',
    'Examples:',
    '  feat(rule-engine): add compound trigger evaluation',
    '  fix(browser): prevent duplicate content-script registration',
    '  security(desktop): validate native messaging origin',
    '  refactor(core)!: replace event payload envelope',
    '',
    'Retry with:  git commit --edit',
    'See docs/development/git-workflow.md.',
  ]);
  process.exit(1);
}

if (process.argv[1]?.endsWith('check-commit-message.mjs')) {
  main();
}
