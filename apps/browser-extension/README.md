# Omnivra browser extension

Control Chrome or Edge with your voice and hand gestures: play, pause, skip, scroll, go back or forward, switch and close tabs, and search the web.

## Install

### Microsoft Edge

Install Omnivra from the Edge Add-ons store. It updates itself.

### Chrome, Brave and other Chromium browsers

1. Download `omnivra-extension-<version>.zip` from the latest [`extension-v*` release](https://github.com/akshaykumar33/Omnivra/releases).
2. Unzip it to a folder you'll keep. The browser loads the extension from that folder, so don't delete it.
3. Open `chrome://extensions` (or `brave://extensions`) and turn on **Developer mode**.
4. Click **Load unpacked** and choose the unzipped folder.
5. Pin Omnivra from the puzzle-piece menu.

To update, download the new zip, replace the folder's contents, then click the reload icon on Omnivra's card.

Chrome may show a banner about developer-mode extensions when it starts. That's expected for extensions installed outside the Chrome Web Store.

## Use

Click the Omnivra icon to open the side panel.

- **Start listening** turns on voice. The first time, a tab opens and asks for microphone access.
- **Start gestures** turns on the camera. The first time, a tab opens and asks for camera access.
- You can also type a command into the box.

| Say                                                        | Does                                         |
| ---------------------------------------------------------- | -------------------------------------------- |
| pause · play · mute · unmute                               | controls the video or audio on the page      |
| skip 30 seconds · rewind 10                                | seeks (10 seconds if you don't say a number) |
| scroll up · scroll down · scroll to top · scroll to bottom | scrolls the page                             |
| back · forward · reload                                    | page history                                 |
| next tab · previous tab · tab 3 · new tab · close tab      | tabs                                         |
| search for …                                               | searches with your default search engine     |

| Gesture (hold for half a second) | Does                    |
| -------------------------------- | ----------------------- |
| ✋ Open palm                     | pause                   |
| ✊ Fist                          | play                    |
| 👍 Thumb up / 👎 Thumb down      | scroll up / down        |
| ☝️ Point up                      | skip forward 10 seconds |
| 🤟 Rock on                       | rewind 10 seconds       |
| ✌️ Victory                       | next tab                |

You can speak naturally: "please pause the video", "can you scroll down" and "go to the next tab" all work. Short commands such as pause, play and scroll run while you are still speaking. The panel shows what it heard under the buttons.

Page commands don't work on the browser's own pages, such as settings or the extensions page.

Gestures are recognised on your device. Voice uses the browser's speech recognition. The full privacy policy is on the website at `/privacy`.

## Develop

```sh
pnpm install
npm run build        # writes dist/; the first run downloads the 8 MB gesture model
npm test             # unit tests
npm run test:e2e     # loads dist/ into Chromium and runs real commands
BROWSER_CHANNEL=msedge npm run test:e2e   # same suite in installed Microsoft Edge
npm run icons        # re-render PNG icons after editing src/icons/icon.svg
```

Load `dist/` with **Load unpacked** to try your changes, and click the reload icon after each build.

## Release

Push a tag such as `extension-v0.1.1`. The **Release browser extension** workflow then:

1. sets the manifest version from the tag;
2. runs the unit and browser tests;
3. attaches the zip to a GitHub Release;
4. uploads the zip to the Chrome Web Store, but only when the `CWS_*` secrets are set.

Submit to Edge Add-ons by uploading the same zip in the Partner Center. The listing text is in [STORE_LISTING.md](STORE_LISTING.md).
