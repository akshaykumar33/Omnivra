# Merge Policy & Branch Protection

`main` is protected, always releasable, and has a linear history. It accepts only
squash-merged, reviewed, green pull requests.

---

## 1. Merge method

**Squash merge by default.** One clean Conventional Commit per PR on `main`. The PR
title becomes that commit message, which is why CI validates it.

**Rebase merge** only when every individual commit is meaningful and independently
valid — a carefully staged refactor, for example. Rare.

**Never a merge commit** from a working branch. `main` keeps a linear history, which
makes `git bisect`, `git log`, and release notes all behave.

---

## 2. Merge checklist

Enforced by branch protection where possible, by review where not:

| Requirement | Enforced by |
| ----------- | ----------- |
| All required checks green | Branch protection |
| Branch up to date with `main` | Branch protection |
| ≥1 approving review | Branch protection |
| CODEOWNERS approval on owned paths | Branch protection |
| All review threads resolved | Branch protection |
| Signed commits | Branch protection |
| Linear history | Branch protection |
| Valid Conventional Commit PR title | CI (`protection-gate.yml`) |
| Valid branch name | CI + `pre-push` hook |
| Secret scan clean | CI + `pre-commit` / `pre-push` hooks |
| Screenshots for UI changes | Review |
| Tests for every functional change | Review |
| Docs/specs/ADRs updated in the same PR | Review |
| Changeset for public API changes | CI (`ci.yml`) |

**Never merge on red.** If a check fails for an "unrelated" reason, fix the check or
file the flake with an owner — do not merge past it. A test suite people routinely
ignore has already stopped being a test suite.

---

## 3. Who merges

The author merges after approval — they know whether anything is still in flight.
Enable auto-merge on green if you would rather not babysit it:

```bash
gh pr merge --squash --auto --delete-branch
```

Delete the branch on merge. GitHub is configured to do this automatically.

---

## 4. Reverting

```bash
gh pr revert <number>        # or: git revert <sha> on a revert/ branch
```

Revert with `git revert` and a `revert:` PR. **Never force-push `main`.** A revert is
a normal change: it gets a branch, a PR, and a review like anything else.

If the revert is urgent, expedite the review — not the checks.

---

## 5. Required repository settings

Configure these on the remote so the rules hold even when someone forgets them.
Settings → Branches → Branch protection rule for `main`:

- [x] Require a pull request before merging
  - [x] Require approvals: **1** minimum
  - [x] Dismiss stale pull request approvals when new commits are pushed
  - [x] Require review from Code Owners
- [x] Require status checks to pass before merging
  - [x] Require branches to be up to date before merging
  - Required checks:
    - `Lint, typecheck, test & build`
    - `Secrets, paths & hygiene`
    - `Gitleaks (second opinion)`
    - `Changeset present for package changes`
    - `Dependency vulnerability audit`
    - `CodeQL static analysis`
- [x] Require conversation resolution before merging
- [x] Require signed commits
- [x] Require linear history
- [x] Do not allow bypassing the above settings **(apply to administrators)**
- [x] Block force pushes
- [x] Block deletions

> Applying rules to administrators is the point, not a formality. A protection an
> admin can wave through is not a protection — it is a suggestion with extra steps.

### Repository-level settings

Settings → General:
- [x] Automatically delete head branches after merge
- [x] Allow squash merging (default), with "Pull request title" as the commit message
- [ ] Allow merge commits — **disabled**
- [x] Allow rebase merging

Settings → Code security:
- [x] Secret scanning
- [x] **Push protection** — the server-side backstop for the local hook
- [x] Dependabot alerts
- [x] Dependabot security updates
- [x] Private vulnerability reporting

Settings → Environments:
- `release` environment holds publishing credentials, restricted to `main`, with
  required reviewers. PR workflows must never have access to it.

### CODEOWNERS

[`.github/CODEOWNERS`](../../.github/CODEOWNERS) must cover, at minimum:

```
architecture/
docs/design/
docs/security/
packages/security/
packages/permissions/
.github/workflows/
.githooks/
scripts/
```

Any path that affects releases, security posture, or the protection gate itself needs
an explicit owner.

---

## 6. What is deliberately *not* automated

Screenshots, the UX checklist, and "does this actually work end to end" are reviewer
judgement. CI can prove that tests pass; it cannot prove the feature is good or that
the empty state was designed. That is what the review is for.
