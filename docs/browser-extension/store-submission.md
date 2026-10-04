# Shipping the extension

**Status: Planned.** Nothing has been submitted. This is the checklist to work
through when there is something to submit, assembled now so that decisions which
constrain the build (icon sizes, privacy policy, permission justifications) are
known before the build rather than discovered at the end.

---

## Before you can submit anything

| Item                 | Detail                                                                                                     | Done |
| -------------------- | ---------------------------------------------------------------------------------------------------------- | ---- |
| Developer account    | One-off 5 USD registration fee at the [Developer Dashboard](https://chrome.google.com/webstore/devconsole) | No   |
| Account verification | Email verification, and a publisher display name                                                           | No   |
| Privacy policy URL   | Publicly reachable. Required because the extension requests microphone and camera                          | No   |
| Host for the policy  | The marketing site is the obvious home: `/privacy`                                                         | No   |

The privacy policy is required even though Omnivra collects nothing. "We collect
nothing" still has to be stated somewhere public and linkable.

---

## Package contents

### Icons

All four sizes, PNG, square, transparent background. The 128px is what the store
listing renders.

| Size | Used for                               |
| ---- | -------------------------------------- |
| 16   | Favicon on the extension's own pages   |
| 32   | Windows, and some toolbar contexts     |
| 48   | Extensions management page             |
| 128  | Installation and the Web Store listing |

### Manifest fields the store reads

```jsonc
{
  "manifest_version": 3,
  "name": "Omnivra",
  "version": "0.1.0", // digits and dots only; no "-alpha" suffix
  "description": "...", // 132 characters maximum
  "icons": { "16": "...", "32": "...", "48": "...", "128": "..." },
  "homepage_url": "https://github.com/akshaykumar33/Omnivra",
}
```

**`version` cannot carry a prerelease suffix.** The workspace uses
`0.1.0-alpha.0`; the manifest must read `0.1.0`. The build strips it, and the
release checklist verifies the two have not drifted apart in a way that makes
the store version meaningless.

The 132-character description limit is a hard cap, not a guideline.

---

## Listing assets

| Asset              | Spec                                 | Notes                                                                                                     |
| ------------------ | ------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Screenshots        | 1280x800 or 640x400 PNG/JPEG, 1 to 5 | At least 3. Show voice, gestures and the rule editor                                                      |
| Small promo tile   | 440x280 PNG/JPEG                     | Required for the listing                                                                                  |
| Marquee promo tile | 1400x560                             | Optional, needed for any featuring                                                                        |
| Demo video         | YouTube URL                          | Strongly recommended. For an input-method product, a static screenshot cannot show the thing that matters |

A video is close to mandatory here in practice. The product is motion and
speech; screenshots of it are screenshots of a browser.

---

## Review answers

Copy these from [permissions.md](./permissions.md) rather than writing them
fresh, so the two cannot disagree.

Required fields:

- **Single purpose description** - one sentence, and it must genuinely be one
  purpose. "Voice and gesture browser control" is one purpose. "Browser control
  and a notes feature" is two, and gets rejected.
- **Justification per permission** - including the optional host permission.
- **Remote code use** - "No, I am not using remote code." Models are bundled.
  This must stay true; fetching a model from a CDN at runtime changes the
  answer and triggers a much slower review.
- **Data usage disclosure** - three certifications: not sold to third parties,
  not used for unrelated purposes, not used to determine creditworthiness.

### The two things most likely to slow review

1. **Microphone and camera.** Expect scrutiny. The privacy policy must say
   plainly that capture is processed locally and never transmitted, and the
   extension must not contain any network call that could contradict that.
2. **Broad host permissions.** Requesting `<all_urls>` at install is the single
   biggest cause of extended review. The design avoids it by making host access
   optional and runtime-requested, and the justification should say so
   explicitly rather than leaving the reviewer to notice.

---

## Pre-submission checks

Run these before every submission, not just the first.

```bash
# Build the production package
pnpm --filter @omnivra/browser-extension build
pnpm --filter @omnivra/browser-extension zip

# The repository's own gates
pnpm run gate            # secrets, sensitive paths, hygiene
pnpm run typecheck
pnpm run build
```

Then, manually:

- [ ] Load the built `.output/chrome-mv3` unpacked and exercise every command
- [ ] Confirm the manifest's permission set matches
      [permissions.md](./permissions.md) exactly, in both directions
- [ ] Confirm `version` has no prerelease suffix
- [ ] Confirm the description is 132 characters or fewer
- [ ] With all permissions refused, confirm the extension still installs, opens
      and explains itself rather than erroring
- [ ] With site access refused, confirm browser-level commands still work
- [ ] Open DevTools on the service worker and confirm there are **no network
      requests at all** during normal operation
- [ ] Confirm the camera and microphone indicators go out when capture stops
- [ ] Run the extension pages through axe; WCAG 2.2 AA is the bar
- [ ] Check the package for stray source maps, fixtures or `.env` files
- [ ] Confirm the privacy policy URL resolves

The "no network requests" check is the one that protects the central claim. It
is worth automating.

---

## Firefox

WXT builds both targets, and the parked scaffold already carries
`build:firefox`. Differences to expect when that becomes relevant:

- Firefox uses `browser_specific_settings.gecko.id`, which Chrome ignores
- `chrome.offscreen` does not exist in Firefox. Firefox allows persistent
  background pages, so capture lives there instead. The capture layer needs an
  abstraction over the two from the start, or this becomes a rewrite
- Firefox review is source-based: minified output must be accompanied by the
  source and build instructions

Do not design the capture layer against `chrome.offscreen` directly. That is the
one decision here that is expensive to undo later.

---

## After publishing

- Store review commonly takes a few days, longer with media permissions
- Published versions cannot be deleted, only unpublished
- A version number can never be reused
- Updates roll out gradually; a staged percentage rollout is available and worth
  using for anything touching capture

---

## Related

- [architecture.md](./architecture.md) - why the design is shaped this way
- [permissions.md](./permissions.md) - the source of truth for justifications
- [user-guide.md](./user-guide.md) - what users are told
- [docs/development/releases.md](../development/releases.md) - repository release process
