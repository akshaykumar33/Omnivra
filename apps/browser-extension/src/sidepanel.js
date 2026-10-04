import { parseCommand, parseBest, isInstant, EXAMPLES } from "./commands.js";
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

// Browsers return no transcripts to speech recognition started in an extension
// page, so recognition runs in a page on the Omnivra website, embedded here in
// a hidden iframe and driven with postMessage. Tests may swap in a local
// stand-in with ?listenerPort=<n>; nothing else can redirect the iframe.
const testPort = Number.parseInt(
  new URLSearchParams(location.search).get("listenerPort") ?? "",
  10,
);
const LISTENER_URL =
  testPort > 0 && testPort < 65536
    ? `http://localhost:${testPort}/listen`
    : "https://omnivra.vercel.app/listen";
const LISTENER_ORIGIN = new URL(LISTENER_URL).origin;

let listener;
let listenerReady;
let listening = false;
// Phrase ids already acted on, so an interim hit doesn't run again when the
// same phrase turns final.
const handled = new Set();

function setListening(on) {
  listening = on;
  toggle.setAttribute("aria-pressed", String(on));
  toggle.textContent = on ? "Stop listening" : "Start listening";
  status.textContent = on ? "Listening…" : "";
}

function toListener(message) {
  listener.contentWindow.postMessage(
    { type: "omnivra-listen", ...message },
    LISTENER_ORIGIN,
  );
}

function loadListener() {
  if (listenerReady) return listenerReady;
  listener = document.createElement("iframe");
  listener.src = LISTENER_URL;
  listener.allow = "microphone";
  listener.hidden = true;
  listener.title = "Omnivra speech recognition";
  listenerReady = new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("Couldn't reach the Omnivra voice service.")),
      15000,
    );
    addEventListener("message", function onReady(event) {
      if (event.origin !== LISTENER_ORIGIN || event.data?.kind !== "ready")
        return;
      clearTimeout(timer);
      removeEventListener("message", onReady);
      resolve();
    });
  });
  document.body.append(listener);
  return listenerReady;
}

const ERRORS = {
  "not-allowed": "Allow the microphone in the tab that opened, then try again.",
  "service-not-allowed": "Speech recognition is turned off in this browser.",
  network:
    "Voice needs an internet connection (the browser's speech service is online).",
  "audio-capture": "No microphone was found.",
  busy: "The microphone or speech service is busy. Close other tabs using voice, then try again.",
  unsupported: "Speech recognition isn't available in this browser.",
};

addEventListener("message", (event) => {
  if (
    event.origin !== LISTENER_ORIGIN ||
    event.data?.source !== "omnivra-listener"
  )
    return;
  const message = event.data;

  if (message.kind === "result" && listening) {
    const alternatives = message.alternatives.filter(Boolean);
    if (!alternatives.length) return;
    status.textContent = `Heard: "${alternatives[0]}"`;
    if (handled.has(message.id)) return;
    const best = parseBest(alternatives);
    if (best && (message.isFinal || isInstant(best.intent))) {
      handled.add(message.id);
      send(best.intent, `"${best.transcript}"`);
    } else if (message.isFinal) {
      handled.add(message.id);
      addLog(`Didn't understand "${alternatives[0]}"`, true);
    }
  }

  if (message.kind === "error") {
    // Transient failures (a network blip) are retried by the listener.
    if (!message.fatal) {
      status.textContent = "Reconnecting…";
      return;
    }
    addLog(ERRORS[message.error] ?? `Mic error: ${message.error}`, true);
    if (message.error === "not-allowed") {
      // A hidden iframe can't show the permission prompt; the page in a tab can.
      chrome.tabs.create({ url: LISTENER_URL });
    }
    setListening(false);
  }
});

toggle.addEventListener("click", async () => {
  if (listening) {
    setListening(false);
    toListener({ action: "stop" });
    return;
  }
  status.textContent = "Starting…";
  try {
    await loadListener();
  } catch (error) {
    status.textContent = "";
    addLog(error.message, true);
    return;
  }
  handled.clear();
  setListening(true);
  toListener({
    action: "start",
    // Match the user's English accent (en-IN, en-GB…) instead of forcing US.
    lang: navigator.language.startsWith("en") ? navigator.language : "en-US",
  });
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
