# Merge Policy & Branch Protection

`main` is protected and always releasable. It accepts only merge-committed, reviewed,
green pull requests, and only after the owner says so.

---

## 1. Merge method

**Merge commits only** — `gh pr merge <n> --merge`. The PR title becomes the merge
commit's subject, which is why CI validates it as a Conventional Commit.

Squashing and rebase merging are **not permitted**, because both destroy the branch's
commit history: squashing collapses every commit into one, and rebase merging rewrites
them with new hashes. The atomic commits an author took care to stage are part of the
record — `git log --first-parent main` gives the one-line-per-PR view that squashing
is usually reached for, without throwing the detail away.

`main` therefore has merge commits in it by design. That is the trade accepted here.

---

## 2. Merge checklist

Enforced by branch protection where possible, by review where not:

| Requirement                            | Enforced by                          |
| -------------------------------------- | ------------------------------------ |
| All required checks green              | Branch protection                    |
| Branch up to date with `main`          | Branch protection                    |
| ≥1 approving review                    | Branch protection                    |
| CODEOWNERS approval on owned paths     | Branch protection                    |
| All review threads resolved            | Branch protection                    |
| Signed commits                         | Branch protection                    |
| Linear history                         | Branch protection                    |
| Valid Conventional Commit PR title     | CI (`protection-gate.yml`)           |
| Valid branch name                      | CI + `pre-push` hook                 |
| Secret scan clean                      | CI + `pre-commit` / `pre-push` hooks |
| Screenshots for UI changes             | Review                               |
| Tests for every functional change      | Review                               |
| Docs/specs/ADRs updated in the same PR | Review                               |
| Changeset for public API changes       | CI (`ci.yml`)                        |

**Never merge on red.** If a check fails for an "unrelated" reason, fix the check or
file the flake with an owner — do not merge past it. A test suite people routinely
ignore has already stopped being a test suite.

---

## 3. Who merges

**The owner merges, and only after saying so explicitly — every time.** A standing
"merge when green" instruction does not carry to the next PR. Show the PR, its checks
and the merge method, get the yes, then:

```bash
gh pr merge <n> --merge
```

**Never delete the branch**, locally or on the remote, before or after the merge. The
branch is part of the history of how the change happened.

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
    - `Full-history secret scan`
    - `Changeset present for package changes`
    - `Dependency vulnerability audit`
- [x] Require conversation resolution before merging
- [ ] Require linear history — **off**; it would forbid the merge commits this
      project requires
- [x] Do not allow bypassing the above settings **(apply to administrators)**
- [x] Block force pushes
- [x] Block deletions

> Applying rules to administrators is the point, not a formality. A protection an
> admin can wave through is not a protection — it is a suggestion with extra steps.

### Two settings deliberately left off, and why

**Required approvals: 0.** On a repository with a single maintainer, requiring one
approval makes every PR unmergeable — GitHub does not let you approve your own pull
request. Requiring a PR and green checks with zero required approvals keeps every
mechanical guarantee (no direct pushes, no merging on red) without
creating a deadlock. Raise this to 1 the moment a second maintainer joins; that is
when it starts protecting something.

**Require signed commits: off, for now.** Enabling it without commit signing
configured locally makes every existing branch unmergeable. Set up SSH or GPG signing
first, then turn it on — see [git-workflow.md](git-workflow.md). Tracked as a
follow-up.

**`CodeQL static analysis` is not in the required list.** Code scanning on a private
repository needs GitHub Advanced Security; without it the upload fails with
"Resource not accessible by integration". The job is gated on
`github.event.repository.visibility == 'public'` so it self-activates if the
repository is ever made public, and a permanently-red check never trains anyone to
ignore a red check.

### Repository-level settings

Settings → General:

- [ ] Automatically delete head branches after merge — **off**; branches are never
      deleted
- [x] Allow merge commits — the only permitted method
- [ ] Allow squashing — **disabled**
- [ ] Allow rebase merging — **disabled**

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

## 6. What is deliberately _not_ automated

Screenshots, the UX checklist, and "does this actually work end to end" are reviewer
judgement. CI can prove that tests pass; it cannot prove the feature is good or that
the empty state was designed. That is what the review is for.
