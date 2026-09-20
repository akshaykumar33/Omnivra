# The Protection Gate

The codebase is protected **before** anything enters history, not after. This matters
most for secrets: a credential that reaches a remote is compromised the moment it
lands, and rewriting history does not un-leak it. Rotation is the fix; history
cleanup is just tidying up afterwards.

---

## 1. How it is wired

Git is pointed at the versioned `.githooks/` directory via `core.hooksPath`:

```bash
pnpm install                      # the `prepare` script does this automatically
# or, in a clone with no dependencies installed:
node scripts/install-hooks.mjs
```

Verify:

```bash
git config --get core.hooksPath   # → .githooks
```

### Why not husky, lint-staged, and commitlint?

Those are the conventional choices and the ones named in the project's master prompt.
This repository uses zero-dependency equivalents instead, for one concrete reason:
**the hooks must work in a clone that has never run `pnpm install`**, and a
devDependency cannot. A gate that silently does nothing until someone installs
dependencies is a gate you cannot rely on — and the highest-risk moment for an
accidental secret commit is early setup, before anyone has installed anything.

The trade-off is explicit:

| | Zero-dep scripts (chosen) | husky + lint-staged + commitlint |
| --- | --- | --- |
| Works pre-install | Yes | No |
| Extra dependencies | None | ~40 transitive packages |
| Ecosystem plugins | None | Large |
| Maintenance | Ours | Upstream |

If the project later wants the commitlint plugin ecosystem, swap it in and record the
change in an ADR. The rules encoded in `scripts/check-commit-message.mjs` are the
same Conventional Commits rules commitlint would enforce.

---

## 2. What the gate blocks

### `pre-commit` — staged changes only, so it stays fast

| Check | Script | Blocks |
| ----- | ------ | ------ |
| Sensitive paths | `check-sensitive-paths.mjs` | `.env`, `*.pem`, `*.key`, `*.p12`, keystores, `id_rsa`, certificates, `credentials.json`, `service-account*.json`, `secrets.*`, `.aws/`, `.ssh/`, captured audio/video, database dumps, model weights, build output, files over 1MB |
| Secret content | `scan-secrets.mjs --staged` | Private key blocks, AWS keys, OpenAI / Anthropic / Gemini / OpenRouter keys, GitHub and npm tokens, Slack tokens and webhooks, Stripe keys, GCP service accounts, Tauri updater keys, JWTs, DB URLs with inline credentials, `.npmrc` auth tokens, and secret-shaped values assigned to credential-named keys |
| Code hygiene | `check-forbidden-patterns.mjs` | `.only` / `fdescribe` / `fit`, skipped tests, `debugger`, `console.*` in shipped source, `@ts-ignore` / `@ts-nocheck` |
| Format & lint | Prettier, ESLint | Only when `node_modules` exists — CI enforces unconditionally |

### `commit-msg`

Conventional Commits validation via `check-commit-message.mjs`. See
[git-workflow.md](git-workflow.md#3-commit-conventions).

### `pre-push`

1. Branch name validation.
2. **Refuses any push to `main` or `develop`.**
3. **Full-branch secret scan** over every line the push would publish. This is the
   check that catches a secret introduced in an *earlier* commit on the branch and
   removed later — the staged scan in `pre-commit` cannot see it, but it is still in
   the history you are about to publish.
4. Gitleaks, if the binary happens to be installed locally.
5. Tests, when dependencies are installed.

---

## 3. Running it manually

```bash
pnpm gate            # everything, across all tracked files
pnpm gate:staged     # only what is staged right now
pnpm gate:secrets    # secret scan alone
pnpm gate:paths      # sensitive path check alone
pnpm gate:hygiene    # code hygiene alone
pnpm gate:branch     # branch name alone
pnpm gate:selftest   # prove the detection rules still work
```

Scan an arbitrary range the way `pre-push` does:

```bash
node scripts/scan-secrets.mjs --range origin/main..HEAD
```

---

## 4. The self-test

`pnpm gate:selftest` builds throwaway git repositories, stages known-bad and
known-good content, and asserts the gate blocks exactly what it should — including
false-positive guards, so a rule cannot be "fixed" by making it match nothing.

It runs in CI on every PR. A detection rule that silently stopped working would
otherwise keep reporting "clean" forever.

---

## 5. Escape hatches

### Inline allow

When a line legitimately contains secret-shaped text — a documented fixture, an
example in a doc — annotate it and say why in the PR description:

```ts
const decoyToken = 'AKIA...'; // secret-scan:allow — fixture for the scanner's own tests
```

For code hygiene, the equivalent is `hygiene:allow`:

```ts
it.skip('reconnects after socket drop'); // hygiene:allow — see #412
```

### Raising the file size limit

```bash
OMNIVRA_MAX_FILE_KB=4096 git commit
```

Justify it in the PR. Large blobs stay in git history forever.

### `--no-verify`

Skips the local hooks. It does **not** skip CI, which re-runs every one of these
checks, so it buys nothing except a later and more public failure. Reserve it for a
genuine emergency and disclose it in the PR description.

---

## 6. Troubleshooting

**Hooks are not running.**
```bash
git config --get core.hooksPath     # expect: .githooks
node scripts/install-hooks.mjs
```
On macOS/Linux also confirm the executable bit: `ls -l .githooks/`.

**`node: command not found` in the hook.**
Your GUI git client may not inherit your shell PATH. Launch it from a terminal, or
point the client at your Node installation.

**A check is wrong.** Fix the rule, not the symptom. The rules live in
`scripts/lib/secret-rules.mjs` and `scripts/check-forbidden-patterns.mjs`, and every
change to them should come with a case in `scripts/selftest-protection.mjs`. That is
how the `console.*` rule learned to exempt `packages/logger/` — the logger is the
sink every other package routes through, so `console.*` is correct exactly there.

**The gate is too slow.** `pre-commit` only reads staged blobs and should be
near-instant. If it is not, you are probably staging something that belongs in
`.gitignore`.

---

## 7. Layers

The local hook is the first line, never the only one:

| Layer | Runs | Can be skipped? |
| ----- | ---- | --------------- |
| `pre-commit` / `commit-msg` / `pre-push` | Your machine | Yes, `--no-verify` |
| Protection Gate workflow | Every PR and push to `main` | No |
| Gitleaks workflow | Every PR and push to `main` | No |
| Full-history scan | Every PR, plus weekly | No |
| GitHub secret scanning + push protection | Server-side, on receive | No |

See [../security/secret-management.md](../security/secret-management.md) for what to
do when something gets through.
