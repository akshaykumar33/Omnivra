# How Omnivra works on every site

**Status: Planned.** Nothing described here is built yet. `apps/browser-extension`
is a stub whose `build` script echoes a string. This document records the design
and, more importantly, the constraints that force it, so the implementation does
not have to rediscover them.

See also [ADR 0004](../../architecture/adr/0004-browser-framework.md) for the
framework choice and
[ADR 0011](../../architecture/adr/0011-offscreen-media-capture.md) for the
capture decision this document explains.

---

## The problem in one sentence

To react to your voice or your hands on any page, the extension needs a sensor
stream that never stops, recognition that runs somewhere it is allowed to run,
and a way to act on a page it does not own. Manifest V3 makes each of those
awkward in a different way, and the awkwardness is the whole design.

## The four places code can live

| Context            | Origin                    | Has DOM         | `getUserMedia`       | Lifetime                |
| ------------------ | ------------------------- | --------------- | -------------------- | ----------------------- |
| Service worker     | `chrome-extension://<id>` | No              | **No**               | Killed after ~30s idle  |
| Content script     | The page's origin         | Yes, the page's | Prompts **per site** | While the tab lives     |
| Offscreen document | `chrome-extension://<id>` | Yes, invisible  | **Once, persists**   | Until explicitly closed |
| Popup / side panel | `chrome-extension://<id>` | Yes             | Once, persists       | Dies when closed        |

Everything below follows from that table.

## Why the microphone cannot live in a content script

This is the question "how does it work across all sites" really turns on.

A content script runs in an isolated JavaScript world, but for permission
purposes it belongs to **the page's origin**. Call `getUserMedia` from a content
script on `github.com` and the user is prompted for the microphone on
`github.com`. Go to `youtube.com` and they are prompted again. Then again on the
next site, and the next. There is no "all sites" grant to collect.

It is worse than tedious. A site can send a
`Permissions-Policy: microphone=(), camera=()` header, and many do. On those
sites a content script is refused outright, with no prompt and no recourse. An
architecture that captures in the content script is an architecture where the
feature silently stops working on an arbitrary subset of the web.

## Why it cannot live in the service worker either

MV3 service workers have no DOM and no `navigator.mediaDevices`. There is no
workaround. They also terminate after roughly 30 seconds of inactivity, which is
the opposite of a continuous listener.

## The answer: one offscreen document

```
                    chrome-extension://<id>          ← ONE origin, ONE grant
   ┌──────────────────────────────────────────────┐
   │  Offscreen document  (invisible, reason:      │
   │                       USER_MEDIA)             │
   │                                               │
   │   getUserMedia ──> MediaStream                │
   │        │                                      │
   │        ├──> Whisper int8 (WASM worker) ──┐    │
   │        └──> MediaPipe Hands (WASM) ──────┤    │
   │                                          │    │
   │                            normalised OmnivraEvent
   └──────────────────────────────────────────┼────┘
                                              │ chrome.runtime
                                              ▼
   ┌──────────────────────────────────────────────┐
   │  Service worker                               │
   │    @omnivra/core kernel                       │
   │    TypedEventBus -> RuleEvaluator             │
   │                  -> ActionDispatcher          │
   └───────────┬───────────────────────┬──────────┘
               │ chrome.tabs           │ chrome.runtime
               │ chrome.scripting      │
               ▼                       ▼
     Browser-level actions      Content script in the
     (new tab, close, zoom,     active tab: DOM-level
      navigate, history)        actions (click, scroll,
                                focus, type, read)
```

The offscreen document runs at `chrome-extension://<id>`. That is a single,
stable origin. The microphone and camera are granted to **the extension**, once,
and the grant persists across restarts. Which website the user happens to be
looking at is irrelevant to capture, because the website is not involved in it.
A site's `Permissions-Policy` cannot block it, because the site is not the one
being asked.

That is the entire reason the feature can claim to work everywhere.

### The gotcha that will cost a day if it is not written down

**An offscreen document cannot show a permission prompt.** It has no visible
surface, so Chrome will not raise a dialog from it. If the extension calls
`getUserMedia` there before a grant exists, it fails rather than prompting.

The grant has to be collected once from a _visible_ extension page: the options
page, or a first-run tab opened on install. After that, the offscreen document
uses the stored grant silently, forever.

### One at a time

Chrome allows exactly one offscreen document per extension. Voice and gesture
therefore share it, which is the right outcome anyway: they share a frame clock
and a worker pool instead of competing for the camera.

### It also solves the service-worker lifetime problem

An open offscreen document keeps the service worker alive. The kernel stays
resident while a sensor is active and is allowed to die when everything is off,
which is exactly the behaviour you want for battery.

## Acting on the page

Two kinds of action, two paths:

**Browser-level** - open or close a tab, navigate, go back, zoom, switch
window. The service worker calls `chrome.tabs` / `chrome.windows` directly.
No content script involved, so these work even on pages where scripts cannot
be injected.

**Page-level** - click, scroll, focus a field, dictate into it, read the
heading structure. The service worker messages the content script in the active
tab, which performs the DOM work. This is where host permissions are required.

## Where "every site" is not true

Honesty matters more than the slogan. Content scripts cannot be injected into:

- `chrome://*`, `edge://*`, `about:*` and other browser-internal pages
- The Chrome Web Store, and other extensions' pages
- `file://` URLs, unless the user ticks "Allow access to file URLs"
- The built-in PDF viewer and some other built-in viewers

On those pages, **browser-level actions still work** (voice can still say "new
tab" or "close tab") because those run from the service worker. Page-level
actions do not. The extension should say so in its UI rather than appear broken.

Cross-origin iframes need `all_frames: true` to be reachable at all, and even
then each frame is a separate injection.

Nothing can drive native browser UI: the address bar, the settings pages, the
profile menu, OS-level dialogs. No extension can, by design.

## Permissions are requested late, not at install

`<all_urls>` at install time is both a trust problem and a Chrome Web Store
review problem. The plan is:

```jsonc
{
  "permissions": ["storage", "offscreen", "activeTab", "scripting", "tabs"],
  "optional_host_permissions": ["<all_urls>"],
  "content_security_policy": {
    // Required for the WASM recognition models. MV3 forbids remote code;
    // model weights are data and may be bundled or cached, but the runtime
    // needs this to instantiate at all.
    "extension_pages": "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'",
  },
}
```

The extension installs able to do nothing to any page. When the user first asks
for a page-level action, it explains what it needs and calls
`chrome.permissions.request({origins: ["<all_urls>"]})` from that user gesture.
A user who declines keeps voice control of the browser and loses control of page
content, which is a coherent state rather than a broken one.

See [permissions.md](./permissions.md) for the justification of every entry.

## Recognition, and a discrepancy worth fixing

The models run in the offscreen document, in workers:

| Modality              | Engine                                | Status  |
| --------------------- | ------------------------------------- | ------- |
| Voice                 | Whisper int8, WASM                    | Planned |
| Hand gesture          | MediaPipe Hands, WASM                 | Planned |
| Eye tracking          | MediaPipe Face Landmarker             | Planned |
| Facial expression     | MediaPipe Face Landmarker blendshapes | Planned |
| Keyboard, controllers | Native browser APIs                   | Planned |

**Chrome's `webkitSpeechRecognition` is not an option here.** It streams audio to
Google's servers. Using it would contradict the local-first claim in
[ADR 0008](../../architecture/adr/0008-local-first-strategy.md) and the "nothing
is streamed to a server" copy on the marketing site.

Note the divergence: **the website's hero demo currently uses the Web Speech
API**, because it is a browser demo with no bundled model. The extension must
not inherit that choice, and the website should either disclose it or move to a
bundled Whisper build. This is recorded rather than quietly carried forward.

## Latency budget

Inherited from [multimodal-pipeline.md](../../architecture/multimodal-pipeline.md):
capture 30 FPS with inference throttled to 15-20 FPS, inference under 25ms,
rule match under 5ms, action dispatch under 15ms, end to end under 120ms.

The extra hop this design adds is one `chrome.runtime` message from the
offscreen document to the service worker, which is sub-millisecond for a small
structured-cloneable payload. It does not threaten the budget.
