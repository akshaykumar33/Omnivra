// Asks for the microphone or camera on behalf of the side panel, which can't
// show Chrome's permission prompt itself. Once allowed, it tells the panel to
// start, returns to the tab the user was on, and closes itself.
const params = new URLSearchParams(location.search);
const kind = params.get("kind") === "video" ? "video" : "audio";
const device = kind === "video" ? "camera" : "microphone";
const returnTo = Number.parseInt(params.get("return") ?? "", 10);
const msg = document.getElementById("msg");
msg.textContent =
  kind === "video"
    ? "Click Allow to let Omnivra use your camera for hand gestures. Video stays on this device."
    : "Click Allow to let Omnivra hear voice commands. You only need to do this once.";

navigator.mediaDevices
  .getUserMedia({ [kind]: true })
  .then(async (stream) => {
    stream.getTracks().forEach((t) => t.stop());
    msg.textContent = `${device[0].toUpperCase()}${device.slice(1)} allowed.`;
    await chrome.runtime
      .sendMessage({ kind: "permission-granted", device: kind })
      .catch(() => {});
    if (returnTo > 0)
      await chrome.tabs.update(returnTo, { active: true }).catch(() => {});
    const self = await chrome.tabs.getCurrent();
    if (self?.id) chrome.tabs.remove(self.id);
  })
  .catch(() => {
    msg.textContent = `The ${device} is blocked for Omnivra. Click the ${device} icon in the address bar, choose Allow, then reload this page.`;
  });
