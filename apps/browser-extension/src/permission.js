const kind =
  new URLSearchParams(location.search).get("kind") === "video"
    ? "video"
    : "audio";
const device = kind === "video" ? "camera" : "microphone";
const msg = document.getElementById("msg");
msg.textContent =
  kind === "video"
    ? "Omnivra needs your camera to recognise hand gestures. Video is processed on this device and never leaves it."
    : "Omnivra needs your microphone to hear voice commands. Audio goes to Chrome's speech recognition and is not stored by Omnivra.";

navigator.mediaDevices
  .getUserMedia({ [kind]: true })
  .then((stream) => {
    stream.getTracks().forEach((t) => t.stop());
    msg.textContent = `Access to the ${device} is allowed. You can close this tab and start again from the side panel.`;
  })
  .catch(() => {
    msg.textContent = `The ${device} was blocked. Allow it from the icon in the address bar, then reload this page.`;
  });
