import { parseCommand, EXAMPLES } from "./commands.js";
import { GESTURES } from "./gesture-map.js";

const toggle = document.getElementById("toggle");
const status = document.getElementById("status");
const log = document.getElementById("log");

for (const example of EXAMPLES) {
  const li = document.createElement("li");
  li.textContent = `"${example}"`;
  document.getElementById("examples").append(li);
}

function addLog(text, isError = false) {
  const li = document.createElement("li");
  li.textContent = text;
  if (isError) li.className = "err";
  log.prepend(li);
  while (log.children.length > 20) log.lastChild.remove();
}

async function send(intent, label) {
  const reply = await chrome.runtime.sendMessage({ kind: "intent", intent });
  addLog(
    reply?.note ? `${label}: ${reply.note}` : `✓ ${label}`,
    !reply?.ok || !!reply?.note,
  );
}

async function handle(transcript) {
  const intent = parseCommand(transcript);
  if (!intent) return addLog(`Didn't understand "${transcript}"`, true);
  return send(intent, `"${transcript}"`);
}

document.getElementById("typed").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.getElementById("cmd");
  if (input.value.trim()) handle(input.value);
  input.value = "";
});

const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
let recognition;
let listening = false;

function setListening(on) {
  listening = on;
  toggle.setAttribute("aria-pressed", String(on));
  toggle.textContent = on ? "Stop listening" : "Start listening";
  status.textContent = on ? "Listening…" : "";
}

async function ensurePermission(kind) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ [kind]: true });
    stream.getTracks().forEach((t) => t.stop());
    return true;
  } catch {
    // Side panels can't show the permission prompt; a full tab can.
    chrome.tabs.create({
      url: chrome.runtime.getURL(`permission.html?kind=${kind}`),
    });
    status.textContent = `Allow the ${kind === "video" ? "camera" : "microphone"} in the tab that opened, then try again.`;
    return false;
  }
}

toggle.addEventListener("click", async () => {
  if (!Recognition) {
    status.textContent = "Speech recognition isn't available in this browser.";
    return;
  }
  if (listening) {
    setListening(false);
    recognition?.stop();
    return;
  }
  if (!(await ensurePermission("audio"))) return;

  recognition = new Recognition();
  recognition.continuous = true;
  recognition.lang = "en-US";
  recognition.onresult = (event) => {
    const result = event.results[event.results.length - 1];
    if (result.isFinal) handle(result[0].transcript);
  };
  recognition.onerror = (event) => {
    if (event.error !== "no-speech") addLog(`Mic error: ${event.error}`, true);
  };
  // Chrome ends sessions after silence; restart while the user still wants to listen.
  recognition.onend = () => listening && recognition.start();
  recognition.start();
  setListening(true);
});

for (const { label, intent } of Object.values(GESTURES)) {
  const li = document.createElement("li");
  const what =
    intent.type === "media"
      ? intent.seconds
        ? `skip ${intent.seconds}s`
        : intent.action
      : intent.type === "scroll"
        ? `scroll ${intent.direction}`
        : "next tab";
  li.textContent = `${label} → ${what}`;
  document.getElementById("gesture-list").append(li);
}

const cameraButton = document.getElementById("camera");
const preview = document.getElementById("preview");
let stopGestures;

function setCamera(on, text) {
  cameraButton.setAttribute("aria-pressed", String(on));
  cameraButton.textContent = text ?? (on ? "Stop gestures" : "Start gestures");
  preview.hidden = !on;
}

cameraButton.addEventListener("click", async () => {
  if (stopGestures) {
    stopGestures();
    stopGestures = undefined;
    return setCamera(false);
  }
  if (!(await ensurePermission("video"))) return;
  cameraButton.textContent = "Loading…";
  try {
    // Loaded on demand so voice-only use never pays for the ~10 MB vision runtime.
    const { startGestures } = await import("./gestures.js");
    preview.hidden = false;
    stopGestures = await startGestures(preview, ({ label, intent }) =>
      send(intent, label),
    );
    setCamera(true);
  } catch (error) {
    setCamera(false);
    addLog(`Camera error: ${error?.message ?? error}`, true);
  }
});
