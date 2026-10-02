# Branching Protocol

Enforced by `scripts/check-branch-name.mjs`, run from the `pre-push` hook and again in
CI on every pull request.

---

## 1. Model

```
main            protected · always releasable · merge commits only · tagged for releases
  │
  ├── feat/rule-engine-compound-triggers
  ├── fix/browser-duplicate-content-script
  └── docs/architecture-plugin-lifecycle
```

Trunk-based development with short-lived branches. There is no long-lived `develop`
branch today; introducing one would be an architectural change and needs
[ADR 0012](../../architecture/adr/0012-branching-and-release-model.md) updated first.

---

## 2. Creating a branch

Mandatory, every time, **before the first edit**:

```bash
git switch main
git pull --ff-only origin main
git switch -c feat/rule-engine-compound-triggers
```

- Never start work in a dirty tree — stash or commit first.
- Never branch from another unmerged branch unless the dependency is real, and say so
  in the PR description when you do.
- `--ff-only` is deliberate: if it fails, your local `main` has diverged and you want
  to know that now rather than halfway through a rebase.

---

## 3. Naming

```
<type>/<scope>-<short-description>
```

| Part          | Rule                                                                                                              |
| ------------- | ----------------------------------------------------------------------------------------------------------------- |
| `type`        | One of `feat`, `fix`, `refactor`, `docs`, `test`, `perf`, `security`, `chore`, `ci`, `build`, `release`, `revert` |
| `scope`       | The package, app, or plugin: `rule-engine`, `browser`, `vscode`, `dashboard`, `deps`                              |
| `description` | 2–5 lowercase words, hyphen-separated, describing the change — not the ticket number                              |

Lowercase only. Single hyphens. Under 70 characters. At least two hyphen-separated
words after the type. Dots are permitted only in `release/` branches, which carry
versions.

### Valid

```
feat/rule-engine-compound-triggers
fix/browser-duplicate-content-script
perf/gesture-reduce-inference-allocations
security/desktop-validate-native-messaging-origin
docs/architecture-plugin-lifecycle
chore/deps-update-workspace
release/v1.2.0
```

### Rejected

```
my-branch          — no type prefix
feat               — nothing after the type
feat/stuff         — single word, and says nothing
Feat/Thing         — must be lowercase
temp               — no type prefix
main / develop     — protected; work never happens directly on them
```

Tool-generated branches are exempt: `dependabot/*`, `renovate/*`,
`changeset-release/*`, `gh-readonly-queue/*`.

Rename a branch you already created:

```bash
git branch -m feat/rule-engine-compound-triggers
```

---

## 4. Branch rules

**One concern per branch.** One milestone, one feature, one bug, or one refactor —
not a mix. A branch that does two things produces a PR nobody can review properly.

**Short-lived.** Open a draft PR the same day so CI runs early. Aim to merge within
about three days. A branch older than a week is a scope problem: split it.

**Stay current.** Rebase onto `main` regularly rather than letting drift accumulate:

```bash
git fetch origin && git rebase origin/main
```

**Force-push carefully.** Always `--force-with-lease`, never bare `--force`, and never
without telling anyone who is reviewing or building on the branch.

**Never delete a branch** — not locally, not on the remote, not after it merges. A
merged branch is the record of how the change was made. Just switch away from it:

```bash
git switch main && git pull --ff-only origin main
```

**No direct commits to `main`.** Not for a typo, not for a hotfix, not "just this
once." The `pre-push` hook refuses it and so does branch protection.

---

## 5. Hotfixes

A production hotfix is still a branch and still a PR:

```bash
git switch main && git pull --ff-only origin main
git switch -c fix/browser-critical-permission-bypass
# fix, test, commit
git push -u origin fix/browser-critical-permission-bypass
gh pr create --title "fix(browser): close permission bypass on host change" --label urgent
```

Expedite the _review_, never the _checks_. The protection gate is exactly what you
want running when you are moving fast under pressure.

---

## 6. Release branches

Releases are cut from `main` by the release workflow (see
[releases.md](releases.md)). A `release/vX.Y.Z` branch is only needed when a release
must be stabilised while `main` moves on — otherwise tag `main` directly.
