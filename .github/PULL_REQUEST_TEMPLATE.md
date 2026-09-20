<!--
  The PR title becomes the squash-merge commit on main, so it must be a valid
  Conventional Commit. CI rejects it otherwise.
    feat(rule-engine): add compound trigger evaluation
  See docs/development/pull-requests.md
-->

## Summary

<!-- What changed, in one or two sentences. -->

## Problem

<!-- What was wrong or missing? Link the issue, milestone, or spec. -->

Closes #

## Solution

<!-- How you solved it, and anything a reviewer would otherwise have to reverse-engineer. -->

## Architecture Impact

<!-- Domain types, public SDK surface, host adapters, package boundaries, event contracts.
     If architecture changed, link the ADR. "None" is a fine answer. -->

- [ ] No architectural change
- [ ] Architectural change — ADR: `architecture/adr/____.md`

---

## Screenshots / Recording

<!--
  REQUIRED for any user-facing change. A UI PR without visual evidence is
  incomplete and will not be merged (docs/design/ + prompts/starter_prompt.md §2.1).
  Include every affected state, in light and dark.
-->

| State             | Light | Dark |
| ----------------- | ----- | ---- |
| Default           |       |      |
| Loading           |       |      |
| Empty             |       |      |
| Error             |       |      |
| Permission denied |       |      |

- [ ] Not a user-facing change

## UX Checklist

<!-- Skip only if this PR touches no user-facing surface. -->

- [ ] Every state is designed: empty, loading, error, permission-denied, offline
- [ ] Operable by keyboard alone, with a visible focus ring and sensible tab order
- [ ] Respects `prefers-reduced-motion` with a working non-animated equivalent
- [ ] Correct in light, dark, and high-contrast themes
- [ ] Responsive at this surface's real constraints (popup / side panel / webview / desktop / dashboard)
- [ ] Copy is real and actionable — no placeholder text, no raw error codes shown alone
- [ ] Interaction feedback lands under 100ms, or has an explicit progress affordance

## Accessibility Impact

<!-- WCAG 2.2 AA. Paste axe results for UI changes. -->

- [ ] Semantic roles and labels on every control
- [ ] Async state announced via a live region
- [ ] Contrast and target sizes verified

---

## Functionality

- [ ] Every feature visible in this PR actually works end to end
- [ ] Nothing is wired to a stub, a mock, or hardcoded sample data
- [ ] Anything intentionally non-functional is visibly marked in the UI **and** the docs

## Testing

<!-- What you added, and the real output of the run. Do not claim a pass you did not see. -->

```
# paste actual output of: pnpm turbo run lint typecheck test
```

- [ ] Unit tests cover every new logical branch
- [ ] Integration / E2E updated where behaviour crosses a boundary
- [ ] No `.only`, and no skipped tests without a linked issue

## Target Surfaces Verified

- [ ] Browser extension (Chrome / Edge / Firefox)
- [ ] VS Code extension
- [ ] Desktop companion (Tauri v2)
- [ ] Dashboard / website
- [ ] Core engine / headless
- [ ] Not surface-specific

---

## Security Impact

- [ ] No new permission or capability requested — or it is justified below
- [ ] No raw camera or microphone data leaves the local process
- [ ] All external input is schema-validated at the boundary
- [ ] Plugin/adapter manifests declare every capability they use

## Secrets Check

<!-- The gate runs automatically, but confirm you looked. -->

- [ ] No credentials, tokens, keys, connection strings, or signing material in the diff
- [ ] No real user data, captured audio/video, or production dumps
- [ ] Any new configuration key is documented in `.env.example` with an empty value
- [ ] `pnpm gate` passes locally
- [ ] I did **not** bypass hooks with `--no-verify` (if I did, I explain why here:)

## Performance Impact

<!-- Measure against docs/engineering/performance-budget.md. -->

- [ ] No regression to bundle size, startup, or inference latency
- [ ] Budget-affecting change measured and reported above

---

## Documentation

- [ ] Docs, specs, and ADRs updated **in this PR** alongside the behaviour change
- [ ] Public API changes documented
- [ ] Storybook stories added or updated for new UI components

## Breaking Changes

- [ ] None
- [ ] Breaking — changeset included and migration documented

## Reviewer Checklist

<!-- For the reviewer, in this order. Block on the first four. -->

- [ ] Correctness
- [ ] Security
- [ ] UX & accessibility
- [ ] Tests
- [ ] Performance
- [ ] Architecture fit
- [ ] Readability
