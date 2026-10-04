# Omnivra for Chrome: user guide

**Status: Planned.** The extension is not built yet, and nothing in this guide
can be followed today. It is written ahead of the build so that the thing we
ship is the thing described here, rather than the other way round.

Capability labels used throughout: **Planned**, **Experimental**, **Alpha**,
**Stable**. Only labels that say Alpha or Stable describe something that works.

---

## What this is

Omnivra lets you drive your browser by speaking, by moving your hands in front
of the webcam, or with the keyboard and controllers you already have. You write
a rule once, and it fires from whichever of those you happen to use.

## What it is not

It is not a screen reader, and it is not a replacement for one. It is not a
voice assistant: it does not answer questions, and there is no chatbot. It
cannot operate the address bar, the settings pages, or anything outside the
browser window, because no extension can.

---

## Installing

### From the Chrome Web Store

Not yet published. This section will carry the link.

### From source, for development

```bash
git clone https://github.com/akshaykumar33/Omnivra.git
cd Omnivra
pnpm install
pnpm --filter @omnivra/browser-extension build
```

Then in Chrome:

1. Go to `chrome://extensions`
2. Turn on **Developer mode** (top right)
3. Click **Load unpacked**
4. Select `apps/browser-extension/.output/chrome-mv3`

For a live-reloading development build, use
`pnpm --filter @omnivra/browser-extension dev` instead, which opens its own
browser profile with the extension already loaded.

---

## First run

On install, Omnivra opens one setup tab. This is the only moment it asks for
anything, and the reason is technical rather than ceremonial: a background page
cannot raise a permission prompt, so the grant has to be collected from a
visible page once. See [architecture.md](./architecture.md) if you want the
detail.

You will be asked for:

- **Microphone**, if you want voice. Declining leaves everything else working.
- **Camera**, if you want gestures or eye tracking. Declining leaves everything
  else working.
- **Access to websites**, if you want Omnivra to act on page content. Declining
  leaves browser-level control working: you can still say "new tab" or "close
  tab", you just cannot say "click the sign-in button".

Each is independent. There is no all-or-nothing step, and you can change any of
them later in the options page or at `chrome://extensions`.

### The indicator

While the microphone or camera is live, Omnivra shows an indicator and Chrome
shows its own. Neither can be hidden by the extension, and that is deliberate.
If you cannot see an indicator, nothing is being captured.

---

## Voice

**Status: Planned.**

Recognition runs on your machine, using a Whisper model bundled with the
extension. Audio does not leave your computer. There is no account, and there
is no server to send it to.

### Wake word and push to talk

Two modes, chosen in options:

- **Push to talk.** Hold a key. Nothing is processed unless you are holding it.
  This is the default, because it is the one that is obviously private.
- **Wake word.** Say "Omnivra" and then the command. A small always-on detector
  listens for that one word locally; full recognition only starts once it fires.

### Built-in commands

| Say                         | What happens                                 | Works without site access |
| --------------------------- | -------------------------------------------- | ------------------------- |
| "New tab"                   | Opens a tab                                  | Yes                       |
| "Close tab"                 | Closes the current tab                       | Yes                       |
| "Next tab" / "Previous tab" | Switches tabs                                | Yes                       |
| "Go back" / "Go forward"    | History navigation                           | Yes                       |
| "Reload"                    | Reloads the page                             | Yes                       |
| "Scroll down" / "Scroll up" | Scrolls the page                             | No                        |
| "Click <label>"             | Clicks the control with that accessible name | No                        |
| "Type <text>"               | Types into the focused field                 | No                        |

The commands in the last column need permission to act on the page you are
looking at.

### Dictation

Focus a text field and say "dictate". Everything after that is typed into the
field until you say "stop dictating". Punctuation is spoken: "comma", "full
stop", "new line".

---

## Hand gestures

**Status: Planned.**

A webcam frame is read, hand landmarks are extracted locally, and the gesture is
classified. Frames are processed and discarded. No video is recorded, stored, or
transmitted.

Planned vocabulary: pinch, open palm, closed fist, swipe left and right, and
finger counts one through five. Each is a trigger you can bind to any action.

Gestures are off by default. The camera is expensive in battery terms and
intrusive in a way a microphone is not, so it is opt-in per session until you
choose otherwise.

---

## Eye tracking and facial expression

**Status: Planned.** Both are designed and neither is implemented. Eye tracking
is intended for dwell-to-click; facial expression is intended as a _modifier_
rather than a trigger, so a raised brow can change what a gesture does rather
than firing something on its own.

---

## Keyboard and controllers

**Status: Planned.**

The inputs you already have, in the same rule format as everything else. A
gesture plus a held key is one trigger, not two. Game controllers are read
through the Gamepad API.

---

## Rules

A rule is: **when** something happens, **if** some condition holds, **do**
something.

```json
{
  "id": "mute-on-palm",
  "name": "Mute the tab on an open palm",
  "enabled": true,
  "priority": 1,
  "trigger": { "type": "gesture", "name": "gesture.hand.palm" },
  "conditions": [
    { "field": "activeApp", "operator": "equals", "value": "browser" }
  ],
  "actions": [
    { "id": "mute", "type": "tab.mute", "capabilityRequired": "tabs.audio" }
  ]
}
```

Set `trigger.name` to `"*"` and the rule fires from every input source. That is
the whole point of the format: the engine does not know or care whether the
event came from your voice, your hand or your keyboard.

You can try this against the real engine right now, without installing
anything. The landing page embeds the same kernel the extension will use, and
the bench section lets you compose a rule and fire it with your keyboard or a
game controller.

### Conditions

Conditions are checked against the context captured with the event:
`activeApp`, `activeUrl`, `activeLanguageId`, `cursorLine`, `timestamp`. A rule
whose condition fails does not fire, and the event log shows it arriving and
matching nothing rather than vanishing.

### Where rules are stored

In `chrome.storage.local`, on your machine. Sync is opt-in and not built.

---

## Privacy

- Recognition runs locally. Audio and video are processed in memory and
  discarded frame by frame.
- Nothing is uploaded. There is no analytics, no telemetry and no account.
- Rules and settings live in local extension storage.
- Site access is requested when you first need it, not at install, and can be
  withdrawn at any time from `chrome://extensions`.

See [permissions.md](./permissions.md) for what each permission is for and what
happens if you refuse it.

---

## Accessibility

Omnivra exists mostly for people who cannot use a keyboard and mouse the way
they are assumed to. The commitments that follow from that:

- Every feature is reachable by keyboard alone. Voice and gesture are additions,
  never the only path.
- The extension UI targets WCAG 2.2 AA, checked in CI rather than at the end.
- `prefers-reduced-motion` is honoured: every animation has a working static
  equivalent, not a disabled one.
- No capability requires a camera or a microphone. Refuse both and the keyboard
  path still does everything.

See [docs/accessibility/](../accessibility/) for the full requirements.

---

## Troubleshooting

**Nothing happens when I speak.** Check the indicator. If it is off, the
microphone was never granted: reopen the options page, which is the only surface
that can raise the prompt. If it is on, check that the rule's trigger matches
the event you are producing; the options page has a live event log.

**It works on some sites and not others.** Page-level actions need site access.
Browser-level actions do not. If "new tab" works but "click sign in" does not,
you have voice working and site access missing.

**Nothing works on this one page.** Some pages cannot be scripted by any
extension: `chrome://` pages, the Chrome Web Store, other extensions' pages, the
PDF viewer, and `file://` URLs unless you have ticked "Allow access to file
URLs". Browser-level commands still work there.

**It stops after a while.** Report it. The background worker is supposed to stay
alive while a sensor is active, and not doing so is a bug rather than a setting.

**The camera light stays on after I turn gestures off.** Report it as a
security issue, not a bug. See [SECURITY.md](../../SECURITY.md).
