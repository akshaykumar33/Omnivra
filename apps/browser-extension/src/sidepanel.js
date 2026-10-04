import { parseCommand, decide, EXAMPLES } from "./commands.js";
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
// page, so recognition runs in a page on the Omnivra website: preferably in a
// pinned background tab (startInTab), else embedded here as a hidden iframe
// (startOnline). Tests may swap in a local stand-in with ?listenerPort=<n>;
// nothing else can change where the listener comes from.
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
// For each phrase id, how many of its commands have been acted on.
// Continuous recognition keeps growing and rewriting one phrase ("play …
// pause"), so a new command shows up as a higher count (see nextCommand).
const handled = new Map();

function setListening(on) {
  if (on !== listening) setDuck(on && duckBox.checked);
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
  // On-device recognition is a separate feature that must be delegated too.
  listener.allow = "microphone; on-device-speech-recognition";
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
  "not-allowed":
    "Microphone access for Omnivra is off. Click Start listening to allow it.",
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
  onSpeech(event.data);
});

// Results and errors from the website listener, in a tab or embedded here.
function onSpeech(message) {
  if (message.kind === "result" && listening) {
    const alternatives = message.alternatives.filter(Boolean);
    if (!alternatives.length) return;
    status.textContent = `Heard: "${alternatives[0]}"`;
    const outcome = decide(
      alternatives,
      message.isFinal,
      handled.get(message.id),
    );
    handled.set(message.id, outcome.actedOn);
    if (outcome.run) send(outcome.run, `"${outcome.transcript}"`);
    if (outcome.notUnderstood) {
      addLog(`Didn't understand "${alternatives[0]}"`, true);
    }
  }

  if (message.kind === "state" && message.engine && listening) {
    status.textContent =
      message.engine === "device"
        ? "Listening (on this device)…"
        : "Listening (online)…";
  }

  if (message.kind === "error") {
    // Transient failures (a network blip) are retried by the listener.
    if (!message.fatal) {
      status.textContent = "Reconnecting…";
      return;
    }
    // Never open tabs from here: errors can repeat, and a tab per error
    // steals focus from whatever the user is doing.
    addLog(ERRORS[message.error] ?? `Mic error: ${message.error}`, true);
    setListening(false);
    stopEngine();
  }
}

// Lowering video volume while listening keeps the video's sound from drowning
// out the user's voice. Remembered across sessions.
const duckBox = document.getElementById("duck");
chrome.storage.local.get("duck").then(({ duck }) => {
  if (duck === false) duckBox.checked = false;
});
duckBox.addEventListener("change", () => {
  chrome.storage.local.set({ duck: duckBox.checked });
  if (listening) setDuck(duckBox.checked);
});

function setDuck(on) {
  chrome.runtime.sendMessage({ kind: "intent", intent: { type: "duck", on } });
}

// Stops whichever engine is running.
let stopEngine = () => {};

toggle.addEventListener("click", () => {
  if (!listening) return startListening();
  setListening(false);
  stopEngine();
});

async function startListening() {
  // Match the user's English accent (en-IN, en-GB…) instead of forcing US.
  const lang = navigator.language.startsWith("en")
    ? navigator.language
    : "en-US";
  handled.clear();
  status.textContent = "Starting…";
  if (await startInTab(lang)) return;
  // The tab couldn't connect: fall back to the listener inside this panel.
  // It uses the extension's microphone permission, so check that first.
  if (!(await ensurePermission("audio"))) return;
  await startOnline(lang);
}

// Fast path: the website listener in a pinned background tab, where the
// browser's on-device engine works (it doesn't inside extension pages or
// iframes). The tab never takes focus except to show a first-time microphone
// prompt, and closes when listening stops.
const TAB_CONNECT_TIMEOUT_MS = 15000;

async function startInTab(lang) {
  const [userTab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  // Listen before opening the tab so a fast-loading page can't connect first.
  let tab;
  const early = [];
  let accept;
  const onConnect = (p) => {
    if (p.name !== "omnivra-voice" || p.sender?.origin !== LISTENER_ORIGIN) {
      return;
    }
    if (!tab) early.push(p);
    else if (p.sender?.tab?.id === tab.id) accept(p);
  };
  chrome.runtime.onConnectExternal.addListener(onConnect);
  const port = await new Promise((resolve) => {
    const timer = setTimeout(() => accept(undefined), TAB_CONNECT_TIMEOUT_MS);
    accept = (p) => {
      clearTimeout(timer);
      chrome.runtime.onConnectExternal.removeListener(onConnect);
      resolve(p);
    };
    chrome.tabs
      .create({
        url: `${LISTENER_URL}?ext=${chrome.runtime.id}`,
        pinned: true,
        active: false,
      })
      .then(
        (created) => {
          tab = created;
          // Only the tab we just opened, on the listener's origin.
          const mine = early.find((p) => p.sender?.tab?.id === tab.id);
          if (mine) accept(mine);
        },
        () => accept(undefined),
      );
  });
  if (!tab) return false;
  if (!port) {
    chrome.tabs.remove(tab.id).catch(() => {});
    return false;
  }

  let stopped = false;
  const stop = () => {
    if (stopped) return;
    stopped = true;
    chrome.tabs.onRemoved.removeListener(onTabClosed);
    try {
      port.postMessage({ type: "omnivra-listen", action: "stop" });
      port.disconnect();
    } catch {
      // Already gone.
    }
    chrome.tabs.remove(tab.id).catch(() => {});
  };
  function onTabClosed(tabId) {
    if (tabId !== tab.id || stopped) return;
    stopped = true;
    if (listening) {
      setListening(false);
      addLog("The voice tab was closed, so listening stopped.");
    }
  }
  chrome.tabs.onRemoved.addListener(onTabClosed);

  port.onMessage.addListener((message) => {
    if (message?.source !== "omnivra-listener") return;
    // First use: the microphone prompt shows in that tab, so bring it forward,
    // then return to where the user was once it's allowed.
    if (message.kind === "needs-permission") {
      chrome.tabs.update(tab.id, { active: true });
      status.textContent = "Click Allow in the Omnivra tab.";
      return;
    }
    if (message.kind === "permission-ok") {
      if (userTab?.id) chrome.tabs.update(userTab.id, { active: true });
      return;
    }
    onSpeech(message);
  });
  port.onDisconnect.addListener(() => {
    if (!stopped && listening) {
      stopped = true;
      setListening(false);
      addLog(
        "Voice stopped unexpectedly. Click Start listening to resume.",
        true,
      );
    }
  });

  setListening(true);
  status.textContent = "Listening…";
  stopEngine = stop;
  port.postMessage({ type: "omnivra-listen", action: "start", lang });
  return true;
}

// Fallback: the website listener embedded in this panel (online engine only).
async function startOnline(lang) {
  status.textContent = "Starting…";
  try {
    await loadListener();
  } catch (error) {
    setListening(false);
    addLog(error.message, true);
    return;
  }
  handled.clear();
  setListening(true);
  status.textContent = "Listening (online)…";
  stopEngine = () => toListener({ action: "stop" });
  toListener({ action: "start", lang });
}

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

// Chrome remembers a granted permission for the extension, so after the first
// time this returns at once without prompting.
async function ensurePermission(kind) {
  const name = kind === "video" ? "camera" : "microphone";
  try {
    const { state } = await navigator.permissions.query({ name });
    if (state === "granted") return true;
  } catch {
    // Older browsers can't query; fall through to asking.
  }
  try {
    // A side panel may leave the request pending forever instead of
    // rejecting it, so give up quickly and ask in a tab instead.
    const request = navigator.mediaDevices.getUserMedia({ [kind]: true });
    request.then(
      (stream) => stream.getTracks().forEach((t) => t.stop()),
      () => {},
    );
    await Promise.race([
      request,
      new Promise((_, reject) => setTimeout(reject, 1500)),
    ]);
    return true;
  } catch {
    // Side panels can't show Chrome's permission prompt, so ask in a tab. That
    // tab closes itself once allowed, returns to the user's tab, and the
    // feature starts (see the permission-granted message below).
    const [current] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true,
    });
    chrome.tabs.create({
      url: chrome.runtime.getURL(
        `permission.html?kind=${kind}&return=${current?.id ?? ""}`,
      ),
    });
    status.textContent = `Click Allow in Chrome's prompt to turn on the ${name}.`;
    return false;
  }
}

chrome.runtime.onMessage.addListener((message) => {
  if (message?.kind !== "permission-granted") return;
  if (message.device === "audio" && !listening) startListening();
  if (message.device === "video" && !stopGestures) startCamera();
});

const cameraButton = document.getElementById("camera");
const preview = document.getElementById("preview");
let stopGestures;

function setCamera(on, text) {
  cameraButton.setAttribute("aria-pressed", String(on));
  cameraButton.textContent = text ?? (on ? "Stop gestures" : "Start gestures");
  preview.hidden = !on;
}

cameraButton.addEventListener("click", () => {
  if (!stopGestures) return startCamera();
  stopGestures();
  stopGestures = undefined;
  setCamera(false);
});

async function startCamera() {
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
}
