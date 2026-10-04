# Permissions

**Status: Planned.** This is the permission set the extension is designed
around, not one it currently requests.

Omnivra treats every permission as a security boundary. Two rules follow from
that, and both are testable:

1. **Nothing is requested that is not used.** A permission in the manifest that
   no code path exercises is a bug, and reviewers are right to reject it.
2. **Nothing broad is requested at install.** Host access is optional and asked
   for at the moment it is first needed, from a user gesture, with an
   explanation.

The second rule is why the extension can install with no ability to touch any
page at all.

---

## Install-time permissions

These appear in `permissions` and are granted when the extension is installed.
None of them grants access to page content.

| Permission  | Why it is needed                                                                                                                                                                      | If it were removed                                                                                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `storage`   | Rules, settings and the model cache live in `chrome.storage.local`.                                                                                                                   | No rules could be saved.                                                                                                                                                |
| `offscreen` | Creates the single invisible document that holds the microphone and camera stream. This is what lets one permission grant cover every site. See [architecture.md](./architecture.md). | Capture would have to move into content scripts, which means prompting on every site and being blocked outright by any site sending a restrictive `Permissions-Policy`. |
| `tabs`      | Browser-level actions: open, close, switch, query the active tab to decide where to send an action.                                                                                   | "New tab", "close tab" and tab switching would be impossible.                                                                                                           |
| `scripting` | Injects the content script into a tab once the user has granted host access for it.                                                                                                   | No page-level actions at all.                                                                                                                                           |
| `activeTab` | Lets a user-invoked action touch the current tab without a standing host permission. Covers the common case before any broad grant exists.                                            | The user would have to grant `<all_urls>` before doing anything on a page.                                                                                              |

`tabs` is the one worth a second look. It exposes tab URLs and titles, which is
real information. It is requested because routing an action to the right tab and
evaluating a rule's `activeUrl` condition both require knowing what the active
tab is. It is not used for history collection, and there is nowhere for such
data to go: the extension has no network calls.

---

## Optional host permissions

```jsonc
"optional_host_permissions": ["<all_urls>"]
```

Requested at runtime, never at install:

```ts
// Must be called from a user gesture.
const granted = await chrome.permissions.request({ origins: ["<all_urls>"] });
```

The user is shown what this enables and what refusing costs them before the
prompt appears. Refusing is a supported state, not a dead end:

|                                               | Granted | Refused       |
| --------------------------------------------- | ------- | ------------- |
| "New tab", "close tab", "go back"             | Works   | **Works**     |
| Tab switching, zoom, reload                   | Works   | **Works**     |
| Scroll, click a control, dictate into a field | Works   | Does not work |
| Reading page structure for "click <label>"    | Works   | Does not work |

A user who refuses keeps voice control of the browser and loses voice control of
page content. The UI says which mode it is in rather than appearing broken.

### Narrower grants

A user who wants Omnivra on three sites and nowhere else can grant
`https://github.com/*` and so on instead of `<all_urls>`. The extension supports
per-origin grants; `<all_urls>` is a convenience, not a requirement.

---

## Runtime media permissions

Microphone and camera are **not** manifest permissions. They are standard web
permissions, granted to the extension's own origin
(`chrome-extension://<id>`) through `getUserMedia`.

This is the detail that makes the whole design work: the grant is given once, to
the extension, and persists. It is not re-asked per site, and a website cannot
block it, because the website is not party to it.

Two consequences:

- **The prompt must come from a visible extension page.** An offscreen document
  cannot raise one. The options page or a first-run tab collects it once.
- **Revoking is done in Chrome, not in Omnivra.** `chrome://settings/content`
  and the site controls for `chrome-extension://<id>` are the authority. The
  extension does not try to shadow that with its own toggle that could drift
  out of sync; its toggles stop capture, they do not pretend to revoke a grant.

Microphone and camera are independent. Voice without camera and gestures without
microphone are both supported configurations.

---

## What is deliberately not requested

| Not requested                 | Why it is tempting                         | Why it is refused                                                                                                                        |
| ----------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `<all_urls>` in `permissions` | Simpler code, no runtime request flow      | Install-time broad host access is the single biggest trust and review problem an extension can have                                      |
| `history`                     | Richer context for rules                   | `tabs` already gives the active URL, which is all a condition needs                                                                      |
| `cookies`                     | Nothing in the product needs it            | Nothing in the product needs it                                                                                                          |
| `downloads`                   | "Download this" sounds like a nice command | Not in scope, and it would widen the blast radius for a marginal feature                                                                 |
| `nativeMessaging`             | The desktop companion will need it         | Not until the desktop companion exists. It will be added with that feature, not before                                                   |
| `<any analytics host>`        | Product metrics                            | There is no telemetry. Adding a host permission for one would contradict [ADR 0008](../../architecture/adr/0008-local-first-strategy.md) |

---

## Content Security Policy

```jsonc
"content_security_policy": {
  "extension_pages": "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'"
}
```

`wasm-unsafe-eval` is required to instantiate the WASM recognition runtimes.
It is not a loophole for remote code: MV3 still forbids loading executable
script from the network, and the models are bundled with the extension or
cached in local storage as data.

No `unsafe-eval`, no `unsafe-inline`, no remote script hosts. If a future
dependency demands any of those, the dependency is the thing that gets
replaced.

---

## Chrome Web Store justifications

The store requires a justification per permission. These are the submission
answers, kept here so they stay consistent with the manifest.

**Single purpose.** Omnivra lets a user operate their browser using voice, hand
gestures and other input methods, by mapping those inputs to browser and page
actions through user-defined rules.

| Field                   | Answer                                                                                                                                                                            |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `storage`               | Stores the user's rules and settings locally. No data is transmitted.                                                                                                             |
| `offscreen`             | Hosts the microphone and camera stream in a single extension-owned document so recognition runs locally and the user is asked for media access once rather than on every website. |
| `tabs`                  | Required to perform user-requested tab actions (open, close, switch) and to route an action to the tab the user is viewing.                                                       |
| `scripting`             | Injects the content script that performs page actions the user has asked for, only on sites the user has granted.                                                                 |
| `activeTab`             | Lets a user-initiated command act on the current tab without requiring broad host access.                                                                                         |
| `<all_urls>` (optional) | Requested at runtime, only when the user asks for an action on page content. Not granted at install. The extension is functional without it.                                      |
| Remote code             | None. All code and models ship in the package.                                                                                                                                    |
| Data usage              | No user data is collected, transmitted or sold. Audio and video are processed in memory on the user's device and discarded.                                                       |

---

## Verifying this document is true

Before each release, the permission set in the built manifest is diffed against
this table. A permission present in one and absent from the other fails the
check. See [store-submission.md](./store-submission.md) for where that sits in
the release flow.
