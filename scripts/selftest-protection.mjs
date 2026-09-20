#!/usr/bin/env node
/**
 * Self-test for the protection gate.
 *
 * Builds a throwaway git repository, stages known-bad and known-good content,
 * and asserts the gate blocks exactly what it should. A gate nobody has proven
 * is a gate nobody should trust.
 *
 *   node scripts/selftest-protection.mjs
 *
 * Runs in CI on every PR (see .github/workflows/protection-gate.yml), so a
 * regression in a detection rule fails the build rather than failing silently.
 */

import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateBranchName } from './check-branch-name.mjs';
import { validateCommitMessage } from './check-commit-message.mjs';
import { isPlaceholder } from './lib/secret-rules.mjs';

const SCRIPTS = dirname(fileURLToPath(import.meta.url));
const green = (s) => `[32m${s}[0m`;
const red = (s) => `[31m${s}[0m`;

let passed = 0;
const failures = [];

function check(name, condition, detail = '') {
  if (condition) {
    passed += 1;
    console.log(`  ${green('✔')} ${name}`);
  } else {
    failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
    console.log(`  ${red('✖')} ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

function section(title) {
  console.log(`\n${title}`);
}

/** Run a gate script inside `cwd`; return its exit code. */
function runGate(script, args, cwd) {
  try {
    execFileSync(process.execPath, [resolve(SCRIPTS, script), ...args], {
      cwd,
      stdio: 'pipe',
      env: { ...process.env, NO_COLOR: '1' },
    });
    return 0;
  } catch (error) {
    return error.status ?? 1;
  }
}

function git(args, cwd) {
  return execFileSync('git', args, { cwd, stdio: 'pipe', encoding: 'utf8' });
}

/** Create an isolated repo, stage `files`, return its path. */
function stageFixture(files) {
  const dir = mkdtempSync(join(tmpdir(), 'omnivra-gate-'));
  git(['init', '--quiet'], dir);
  git(['config', 'user.email', 'selftest@example.invalid'], dir);
  git(['config', 'user.name', 'Gate Selftest'], dir);
  git(['config', 'commit.gpgsign', 'false'], dir);

  for (const [name, content] of Object.entries(files)) {
    const target = join(dir, name);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content);
  }
  git(['add', '--all', '--force'], dir);
  return dir;
}

function withFixture(files, fn) {
  const dir = stageFixture(files);
  try {
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// Assembled at runtime so this file never contains a contiguous credential-shaped
// literal — the repo's own scanner excludes it, but defence in depth is cheap.
const fakeAws = 'AKIA' + 'Z3JQWLMNPQRSTUVW';
const fakeGithub = 'ghp_' + 'aB3xK9mQ7rT2vY5nL8cF4hJ6wZ1pS0dG7uE2';
const fakePem = '-----BEGIN RSA PRIVATE KEY-----';
// Split around the credential: a contiguous connection URI here reads as a real
// leak to every other scanner (GitGuardian and gitleaks both flagged it), and an
// alert people learn to dismiss is worse than no alert.
const fakeDbUrl = 'postgresql://omnivra:' + 'h7Kq2Wmz9Lx4' + '@db.internal:5432/omnivra';

section('Secret scanner — must BLOCK');
check(
  'AWS access key ID in source',
  withFixture({ 'src/config.ts': `export const key = '${fakeAws}';\n` }, (d) =>
    runGate('scan-secrets.mjs', ['--staged'], d),
  ) === 1,
);
check(
  'GitHub token in source',
  withFixture({ 'src/ci.ts': `const token = '${fakeGithub}';\n` }, (d) =>
    runGate('scan-secrets.mjs', ['--staged'], d),
  ) === 1,
);
check(
  'Private key block',
  withFixture({ 'src/key.txt': `${fakePem}\nMIIEow...\n` }, (d) =>
    runGate('scan-secrets.mjs', ['--staged'], d),
  ) === 1,
);
check(
  'Database URL with inline password',
  withFixture({ 'src/db.ts': `const url = '${fakeDbUrl}';\n` }, (d) =>
    runGate('scan-secrets.mjs', ['--staged'], d),
  ) === 1,
);
check(
  'Generic assigned secret with real entropy',
  withFixture({ 'src/a.ts': `const apiKey = "j4X9qLm2Zt7Bw0Rv6Ny8Hc3Ks1Pd5Fg";\n` }, (d) =>
    runGate('scan-secrets.mjs', ['--staged'], d),
  ) === 1,
);

section('Secret scanner — must ALLOW (false-positive guard)');
check(
  'Env var reference',
  withFixture({ 'src/a.ts': 'const apiKey = process.env.OMNIVRA_API_KEY;\n' }, (d) =>
    runGate('scan-secrets.mjs', ['--staged'], d),
  ) === 0,
);
check(
  'Explicit placeholder value',
  withFixture({ '.env.example': 'OMNIVRA_API_KEY=sk-REPLACE_ME\n' }, (d) =>
    runGate('scan-secrets.mjs', ['--staged'], d),
  ) === 0,
);
check(
  'Inline secret-scan:allow escape hatch',
  withFixture(
    { 'src/a.ts': `const decoy = '${fakeAws}'; // secret-scan:allow documented fixture\n` },
    (d) => runGate('scan-secrets.mjs', ['--staged'], d),
  ) === 0,
);
check(
  'Ordinary prose and code',
  withFixture({ 'README.md': '# Omnivra\n\nAny input, any logic, any action.\n' }, (d) =>
    runGate('scan-secrets.mjs', ['--staged'], d),
  ) === 0,
);

section('Sensitive paths — must BLOCK');
for (const [label, file] of [
  ['.env file', '.env'],
  ['PEM key file', 'certs/server.pem'],
  ['SSH private key', 'id_rsa'],
  ['service account JSON', 'service-account-prod.json'],
  ['captured audio', 'recordings/session.wav'],
  ['model weights', 'models/gesture.onnx'],
]) {
  check(
    label,
    withFixture({ [file]: 'placeholder content\n' }, (d) =>
      runGate('check-sensitive-paths.mjs', ['--staged'], d),
    ) === 1,
  );
}

section('Sensitive paths — must ALLOW');
check(
  '.env.example',
  withFixture({ '.env.example': 'OMNIVRA_API_KEY=\n' }, (d) =>
    runGate('check-sensitive-paths.mjs', ['--staged'], d),
  ) === 0,
);
check(
  'certificate under fixtures/',
  withFixture({ 'packages/core/fixtures/test.crt': 'fixture\n' }, (d) =>
    runGate('check-sensitive-paths.mjs', ['--staged'], d),
  ) === 0,
);
check(
  'oversized file is blocked',
  withFixture({ 'big.txt': 'x'.repeat(1024 * 1024 + 10) }, (d) =>
    runGate('check-sensitive-paths.mjs', ['--staged'], d),
  ) === 1,
);

section('Code hygiene — must BLOCK');
check(
  'focused test (.only)',
  withFixture({ 'src/a.test.ts': 'describe.only("x", () => {});\n' }, (d) =>
    runGate('check-forbidden-patterns.mjs', ['--staged'], d),
  ) === 1,
);
check(
  'debugger statement',
  withFixture({ 'src/a.ts': 'function f() { debugger; }\n' }, (d) =>
    runGate('check-forbidden-patterns.mjs', ['--staged'], d),
  ) === 1,
);
check(
  '@ts-ignore suppression',
  withFixture({ 'src/a.ts': '// @ts-ignore\nconst x: number = "s";\n' }, (d) =>
    runGate('check-forbidden-patterns.mjs', ['--staged'], d),
  ) === 1,
);
check(
  'console.log in package source',
  withFixture({ 'packages/core/src/a.ts': 'console.log("hi");\n' }, (d) =>
    runGate('check-forbidden-patterns.mjs', ['--staged'], d),
  ) === 1,
);

section('Code hygiene — must ALLOW');
check(
  'console.log inside scripts/',
  withFixture({ 'scripts/tool.mjs': 'console.log("hi");\n' }, (d) =>
    runGate('check-forbidden-patterns.mjs', ['--staged'], d),
  ) === 0,
);
check(
  'console.* inside the logger sink package',
  withFixture({ 'packages/logger/src/index.ts': 'console.debug("x");\n' }, (d) =>
    runGate('check-forbidden-patterns.mjs', ['--staged'], d),
  ) === 0,
);
check(
  'console.log in a test file',
  withFixture({ 'packages/core/src/a.test.ts': 'console.log("x");\n' }, (d) =>
    runGate('check-forbidden-patterns.mjs', ['--staged'], d),
  ) === 0,
);

section('Branch names');
for (const name of [
  'feat/rule-engine-compound-triggers',
  'fix/browser-duplicate-content-script',
  'chore/deps-update-workspace',
  'release/v1.2.0',
  'dependabot/npm_and_yarn/typescript-5.7.3',
]) {
  check(`accepts ${name}`, validateBranchName(name).ok === true);
}
for (const name of ['main', 'develop', 'my-branch', 'Feat/Thing', 'feat/', 'feat/stuff', 'temp']) {
  check(`rejects ${name}`, validateBranchName(name).ok === false);
}

section('Commit messages');
for (const message of [
  'feat(rule-engine): add compound trigger evaluation',
  'fix(browser): prevent duplicate content-script registration',
  'docs: document the protection gate',
  'refactor(core)!: replace event payload envelope\n\nBREAKING CHANGE: consumers must migrate.',
  'Merge branch main into feat/thing',
]) {
  check(
    `accepts "${message.split('\n')[0].slice(0, 46)}…"`,
    validateCommitMessage(message).errors.length === 0,
  );
}
for (const message of [
  'updates',
  'Fixed the bug.',
  'feat: x',
  'FEAT(core): add thing',
  'feat(core) add thing',
  'feat(core): this subject line is deliberately far too long to be acceptable here',
]) {
  check(
    `rejects "${message.slice(0, 46)}"`,
    validateCommitMessage(message).errors.length > 0,
  );
}

section('Placeholder heuristics');
check('detects REPLACE_ME', isPlaceholder('sk-REPLACE_ME') === true);
check('detects ${VAR} interpolation', isPlaceholder('${OMNIVRA_KEY}') === true);
check('detects <your-key-here>', isPlaceholder('<your-key-here>') === true);
check('detects repeated chars', isPlaceholder('xxxxxxxxxxxx') === true);
check('does not flag real entropy', isPlaceholder('j4X9qLm2Zt7Bw0Rv6Ny8Hc3Ks1Pd5Fg') === false);

console.log(`\n${failures.length === 0 ? green('PASS') : red('FAIL')} — ${passed} passed, ${failures.length} failed`);
if (failures.length) {
  for (const failure of failures) console.log(`  ${red('✖')} ${failure}`);
  process.exit(1);
}
