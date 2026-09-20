# Git Workflow

Every change reaches `main` the same way:

```
branch → build → verify → secret-scan → commit → push → PR → green checks → review → merge
```

There is no path to `main` that skips it. `main` is protected, always releasable, and
accepts only squash-merged, reviewed, green pull requests.

| Topic | Document |
| ----- | -------- |
| Branch model, naming, lifecycle | [branching.md](branching.md) |
| The local protection gate (hooks) | [commit-hooks.md](commit-hooks.md) |
| Authoring and reviewing PRs | [pull-requests.md](pull-requests.md) |
| Merge requirements and branch protection | [merge-policy.md](merge-policy.md) |
| Secret handling and leak response | [../security/secret-management.md](../security/secret-management.md) |
| Releases and changesets | [releases.md](releases.md) |

---

## 1. One-time setup

```bash
git clone https://github.com/akshaykumar33/Omnivra.git
cd Omnivra
pnpm install          # installs dependencies AND activates the git hooks
```

The `prepare` script points git at the versioned `.githooks/` directory. If you have
not run `pnpm install` yet — or hooks ever stop firing — activate them directly:

```bash
node scripts/install-hooks.mjs
git config --get core.hooksPath     # should print: .githooks
```

The hooks are plain Node and shell scripts with **no dependencies**, so they work in a
fresh clone before anything is installed.

---

## 2. The loop

```bash
# 1. Start from an up-to-date main — never from a dirty tree
git switch main
git pull --ff-only origin main
git switch -c feat/rule-engine-compound-triggers

# 2. Work, committing in small atomic steps
git add -p
git commit -m "feat(rule-engine): add compound trigger evaluation"

# 3. Stay current with main
git fetch origin
git rebase origin/main

# 4. Push and open a draft PR immediately
git push -u origin feat/rule-engine-compound-triggers
gh pr create --draft --fill

# 5. Mark ready when the PR checklist is genuinely satisfied,
#    then merge after approval + green checks
```

Run the gate yourself at any point:

```bash
pnpm gate           # secrets, sensitive paths, hygiene, branch name
pnpm gate:staged    # same, but only what is staged right now
```

---

## 3. Commit conventions

All commits follow [Conventional Commits](https://www.conventionalcommits.org/),
enforced by the `commit-msg` hook and re-checked in CI.

```
<type>(<scope>): <imperative summary, max 72 chars total>

<body — why, not what; the diff already says what>

<footer — BREAKING CHANGE: …, Closes: #123>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`,
`chore`, `revert`, `security`

**Scope** is the package, app, or plugin: `core`, `rule-engine`, `browser`, `vscode`,
`desktop`, `dashboard`, `deps`.

### Good

```
feat(rule-engine): add compound trigger evaluation
fix(browser): prevent duplicate content-script registration
docs(architecture): document plugin lifecycle
refactor(core): extract event normalization pipeline
test(voice): add wake-word recognition coverage
perf(gesture): reduce inference allocations
security(desktop): validate native messaging origin
chore(deps): update workspace dependencies
refactor(core)!: replace event payload envelope
```

### Rejected

```
updates                     — says nothing
Fixed the bug.              — capitalised, trailing period, no type
feat: x                     — subject too short
FEAT(core): add thing       — type must be lowercase
feat(core) add thing        — missing the colon
wip                         — never merge work-in-progress commits
```

### Commit hygiene

Commits must be **atomic, understandable, reversible, scoped, and tested**. A milestone
should produce several readable commits rather than one enormous one:

```
feat(event-bus): implement typed event subscriptions
test(event-bus): cover listener cleanup
docs(event-bus): document subscription lifecycle
```

Never commit build output, `node_modules`, local editor settings, model weights,
captured media, or anything matching the deny-list in
[commit-hooks.md](commit-hooks.md#2-what-the-gate-blocks).

---

## 4. Rebase, don't merge

Working branches rebase onto `main`. Conflicts get resolved on your branch, never on
`main`, and `main` keeps a linear history.

```bash
git fetch origin
git rebase origin/main
git push --force-with-lease      # never a bare --force
```

If someone else is reviewing or building on your branch, tell them before you
force-push.

---

## 5. Emergencies

There is no bypass. A hotfix uses a `fix/*` branch with an expedited review — not a
direct push to `main`, which the `pre-push` hook and branch protection both refuse.

`--no-verify` skips the local hooks but not CI, which re-runs every check. It buys
nothing except a later, more public failure. If you ever use it, say so in the PR
description.
