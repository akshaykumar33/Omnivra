# ADR 0011: Offscreen Document for Media Capture

## Status

Accepted

## Context

Omnivra's central claim is that voice and gesture control work on any site. Under Manifest V3 the obvious implementation does not deliver that. A content script shares the host page's origin for permission purposes, so `getUserMedia` prompts the user separately on every website, and a site serving `Permissions-Policy: microphone=(), camera=()` refuses the request outright with no prompt and no recourse. MV3 service workers cannot capture at all: they have no DOM and no `navigator.mediaDevices`, and they terminate after roughly 30 seconds idle.

## Decision

Capture the microphone and camera in a single offscreen document created with `chrome.offscreen.createDocument({ reasons: ["USER_MEDIA"] })`, and run all recognition there in WASM workers. Normalised events are posted to the service worker, which hosts the `@omnivra/core` kernel and dispatches matched actions.

## Alternatives Considered

Capture per content script (prompts on every origin, defeated by `Permissions-Policy`, and leaks capture into untrusted page contexts). Capture in a persistent popup or side panel (dies the moment the user closes it). Capture in a pinned extension tab (visible, closable, and user-hostile). Routing capture through the desktop companion over native messaging (viable later, but makes the browser extension useless on its own).

## Consequences

Media permission is granted once to `chrome-extension://<id>` and persists, independent of the site being viewed, which is what makes the cross-site claim true. An open offscreen document also keeps the service worker alive, solving the lifetime problem for free. Two costs follow. An offscreen document cannot raise a permission prompt, so the grant must be collected once from a visible extension page, and Chrome permits only one offscreen document per extension, so voice and gesture share it. The second cost is acceptable and arguably desirable, since both then share one frame clock and worker pool.

`chrome.offscreen` is Chrome-only. The capture layer must be written against an internal interface rather than the API directly, because Firefox has no equivalent and uses a persistent background page instead. Designing against `chrome.offscreen` directly would turn Firefox support into a rewrite.

## Security Impact

Keeps raw audio and video out of page contexts entirely: a content script never touches a MediaStream, so a compromised or hostile page has nothing to reach for. Capture is confined to the extension origin, where it is subject to the extension CSP rather than the page's. Instantiating the WASM recognition runtimes requires `wasm-unsafe-eval` in `content_security_policy.extension_pages`; models ship bundled as data, and no remote code is loaded.

## Performance Impact

Adds one `chrome.runtime` message per recognised event between the offscreen document and the service worker, which is sub-millisecond for a small structured-cloneable payload and does not threaten the 120ms end-to-end budget in `architecture/multimodal-pipeline.md`. Consolidating both sensors into one document avoids duplicate camera acquisition and a second worker pool.

## Revisit Conditions

Revisit if Chrome grants service workers direct media access, if a cross-browser standard replaces `chrome.offscreen`, or if the desktop companion becomes a prerequisite for the browser extension in any case.
