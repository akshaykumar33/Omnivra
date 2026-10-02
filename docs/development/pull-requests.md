# Pull Requests

Every change reaches `main` through a pull request. No exceptions — not for a typo,
not for a hotfix.

---

## 1. Opening

```bash
git push -u origin feat/rule-engine-compound-triggers
gh pr create --draft --fill
```

Open the PR as a **draft immediately**, before the work is finished. CI runs early,
problems surface while they are still cheap, and the work is visible.

**The PR title is the merge-commit subject on `main`**, so it must be a valid
Conventional Commit. CI rejects it otherwise:

```
feat(rule-engine): add compound trigger evaluation
```

Link the milestone, phase, and any issue it closes. Mark the PR ready for review only
when the template checklist is genuinely satisfied — not aspirationally.

---

## 2. What the template requires

The full checklist lives in
[`.github/PULL_REQUEST_TEMPLATE.md`](../../.github/PULL_REQUEST_TEMPLATE.md). Three
sections are worth calling out because they are the ones most often skipped:

### Screenshots — required for any user-facing change

Every affected state, in light and dark: default, loading, empty, error, and
permission-denied. **A UI PR without visual evidence is incomplete and will not be
merged.** Reviewers cannot evaluate a design they cannot see, and "it looks fine on my
machine" is not reviewable.

### Secrets check

The gate runs automatically, but confirm you actually looked at your own diff:
credentials, tokens, connection strings, signing material, real user data, captured
audio or video. Any new configuration key belongs in `.env.example` with an empty
value.

If you bypassed hooks with `--no-verify`, say so and say why.

### Testing

Paste the **real output** of the run. Do not claim a pass you did not see. A PR that
says "all tests pass" with no output, against a repo where they did not, is worse than
one that admits a failure.

---

## 3. Merge requirements

All of these must be true. See [merge-policy.md](merge-policy.md) for the enforcement
details.

- [ ] All CI checks green — never merge on red, and never wave through a flake without
      fixing or filing it
- [ ] At least one approving review; CODEOWNERS approval for owned paths
- [ ] Every review thread resolved
- [ ] Branch up to date with `main`
- [ ] Tests added or updated for every functional change
- [ ] Screenshots present for every UI change
- [ ] Docs, specs, and ADRs updated **in the same PR** as the behaviour change
- [ ] Changeset included if a published package's public API changed
- [ ] No `.only`, no skipped tests without a linked issue, no new lint suppressions
      without an inline justification
- [ ] Secret scan clean

---

## 4. Reviewing

Review in this order, and **block on the first four**:

1. **Correctness** — does it do what it claims, including at the edges?
2. **Security** — permissions, input validation, secret handling, capability
   boundaries. Does raw camera or microphone data stay local?
3. **UX & accessibility** — are all states designed? Keyboard-complete? Contrast and
   focus visible? Does the copy help someone who is stuck?
4. **Tests** — do they cover the logic, or just the happy path? Would they fail if the
   implementation were wrong?
5. **Performance** — against the budgets in
   [performance-budget.md](../engineering/performance-budget.md).
6. **Architecture fit** — does the core stay host-agnostic? Do package boundaries hold?
7. **Readability**.

Comment, don't block, on style a linter could have caught — then add the lint rule so
no one has to comment on it again.

### Reviewer etiquette

- Say which comments are blocking and which are suggestions. Ambiguity costs a round trip.
- Ask about intent before asserting a bug: "what happens when `hosts` is empty?" beats
  "this crashes."
- Approve when it is good enough to merge, not when it is what you would have written.
- If you request changes, be specific enough that the author knows when they are done.

---

## 5. Responding to review

- Push fixes as new commits while review is in progress — force-pushing mid-review
  destroys the reviewer's diff. Tidy the branch before you ask for the merge; the
  merge commit preserves every commit on it, so make them readable.
- Resolve a thread when you have addressed it, not when you have read it.
- Disagreeing is fine. Explain the reasoning, and if you still disagree after that,
  escalate to a second reviewer rather than quietly merging.

---

## 6. Draft vs. ready

| State             | Meaning                                                    |
| ----------------- | ---------------------------------------------------------- |
| Draft             | Work in progress. CI runs; reviewers are not expected.     |
| Ready for review  | The checklist is satisfied. You believe this is mergeable. |
| Changes requested | Blocking feedback. Address it, then re-request review.     |
| Approved          | Merge once checks are green and threads are resolved.      |

Moving a PR to "ready" with an unfinished checklist wastes a reviewer's time — the
most expensive resource in the process.
