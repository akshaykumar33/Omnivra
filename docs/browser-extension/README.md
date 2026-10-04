# Browser extension

**Status: Planned.** `apps/browser-extension` is currently a stub whose build
script echoes a string. A WXT scaffold exists on the
`feat/browser-extension-voice-gesture` branch and has not been merged.

These documents were written before the build on purpose. The hard constraints
in Manifest V3 (where a microphone is allowed to live, what a service worker
cannot do, which pages can never be scripted) determine the shape of the code,
and discovering them during implementation is how extensions end up with a
capture layer that works on the author's machine and nowhere else.

| Document                                     | What it answers                                                                               |
| -------------------------------------------- | --------------------------------------------------------------------------------------------- |
| [architecture.md](./architecture.md)         | How voice and gesture control reach every site, and where "every site" stops being true       |
| [user-guide.md](./user-guide.md)             | What a user installs, grants, says and does                                                   |
| [permissions.md](./permissions.md)           | Every permission, why it exists, what refusing it costs, and the Web Store justification text |
| [store-submission.md](./store-submission.md) | Everything required to publish, with the pre-submission checks                                |

## The short version

The microphone and camera live in a single invisible **offscreen document**
owned by the extension, not in content scripts on each page. That one decision
is what makes "works on every site" possible: media access is granted once to
`chrome-extension://<id>` and persists, instead of being requested per website
and refused outright by any site that sends a restrictive `Permissions-Policy`.

Recognition runs there, locally, in WASM workers. Normalised events go to the
service worker, which runs the same `@omnivra/core` kernel the landing page
embeds. Matched actions are dispatched either as browser-level operations
through `chrome.tabs`, or as page-level operations through a content script.

Host access is optional and requested at runtime, so the extension installs
unable to touch any page, and a user who refuses keeps full browser-level voice
control.

## Related

- [ADR 0004](../../architecture/adr/0004-browser-framework.md) - why WXT
- [ADR 0011](../../architecture/adr/0011-offscreen-media-capture.md) - why the offscreen document
- [architecture/browser-architecture.md](../../architecture/browser-architecture.md) - component diagram
- [architecture/multimodal-pipeline.md](../../architecture/multimodal-pipeline.md) - recognition lifecycle and latency budgets
