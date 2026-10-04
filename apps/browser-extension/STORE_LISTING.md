# Chrome Web Store listing

Copy these into the Developer Dashboard when you submit or update the item.

## Product details

**Name:** Omnivra

**Summary (132 chars max):**
Control your browser hands-free: play, pause, skip, scroll, switch tabs and search with your voice or hand gestures.

**Category:** Accessibility

**Description:**

Omnivra lets you control Chrome without touching the keyboard or mouse.

Click the Omnivra icon to open the side panel, then start voice control, gestures, or both.

VOICE COMMANDS
• Media: "pause", "play", "mute", "unmute", "skip 30 seconds", "rewind 10"
• Page: "scroll down", "scroll up", "scroll to top", "scroll to bottom", "back", "forward", "reload"
• Tabs: "next tab", "previous tab", "tab 3", "new tab", "close tab"
• Search: "search for weather in Pune"

HAND GESTURES
✋ Open palm: pause
✊ Fist: play
👍 Thumb up / 👎 Thumb down: scroll up / down
☝️ Point up: skip forward 10 seconds
🤟 Rock on: rewind 10 seconds
✌️ Victory: next tab

PRIVATE BY DESIGN
• Gestures are recognised on your device; camera video never leaves your computer.
• Voice uses Chrome's built-in speech recognition.
• No accounts, no analytics, no data collection.

Media commands work on any page with a standard video or audio player, including YouTube.

## Privacy practices tab

**Single purpose:**
Lets the user control the browser (media playback, scrolling, navigation, tabs and search) with voice commands and hand gestures.

**Permission justifications:**

- `tabs`: switch to, open, close, reload and navigate back or forward in tabs when the user says a command.
- `scripting`: run a small function in the active page to play, pause, seek, mute or scroll its media and content.
- `search`: run the user's spoken search with their default search engine.
- `sidePanel`: show the controls, command log and camera preview.
- Host permission (`<all_urls>`): media and scroll commands must work on whatever page the user is on.

**Remote code:** No. All code, including the MediaPipe runtime and model, is packaged in the extension.

**Data usage:** Collects none of the listed data types. Certify all three disclosures.

**Privacy policy URL:** `https://<your-vercel-domain>/privacy`

## Assets to upload

- Store icon: `src/icons/icon-128.png`
- At least one screenshot, 1280×800: the side panel open next to a YouTube video
- Optional small promo tile, 440×280
