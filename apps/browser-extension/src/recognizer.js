// On-device speech recognition run directly in the side panel.
//
// Chrome's online speech service returns nothing to extension pages, and it
// hides on-device recognition from embedded cross-origin pages, so when the
// browser has an on-device model the panel listens itself. It is faster (no
// network round trip), works offline, and audio never leaves the computer.

const Recognition =
  globalThis.SpeechRecognition ?? globalThis.webkitSpeechRecognition;

// Sessions in a row that may end without audio before giving up.
const MAX_STALLS = 5;
const FATAL = ["not-allowed", "service-not-allowed", "audio-capture"];
// Speech detected but no text by then means the engine isn't working here.
const SILENT_AFTER_SPEECH_MS = 6000;

export async function onDeviceAvailable(lang) {
  if (!Recognition?.available) return false;
  try {
    return (
      (await Recognition.available({ langs: [lang], processLocally: true })) ===
      "available"
    );
  } catch {
    return false;
  }
}

// Calls onMessage with the same messages the website listener posts:
// { kind: "result", id, alternatives, isFinal } and { kind: "error", error, fatal }.
// Returns a function that stops listening.
export function listenOnDevice(lang, onMessage) {
  let wanted = true;
  let session = 0;
  let stalls = 0;
  let current;
  // In some Chrome setups the on-device engine hears speech in an extension
  // page but never returns text. If speech is detected and nothing comes back
  // in time, report it so the panel can switch to the online listener.
  let gotResult = false;
  let watchdog;
  const watch = () => {
    if (gotResult || watchdog) return;
    watchdog = setTimeout(() => {
      if (gotResult || !wanted) return;
      wanted = false;
      current?.abort();
      onMessage({ kind: "error", error: "device-silent", fatal: true });
    }, SILENT_AFTER_SPEECH_MS);
  };

  const open = () => {
    const r = new Recognition();
    const id = ++session;
    let heardAudio = false;
    r.continuous = true;
    r.interimResults = true;
    r.maxAlternatives = 5;
    r.lang = lang;
    r.processLocally = true;
    r.onaudiostart = () => {
      heardAudio = true;
      stalls = 0;
    };
    r.onsoundstart = watch;
    r.onspeechstart = watch;
    r.onresult = (event) => {
      gotResult = true;
      clearTimeout(watchdog);
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        onMessage({
          kind: "result",
          id: `d${id}:${i}`,
          alternatives: Array.from(result, (alt) => alt.transcript.trim()),
          isFinal: result.isFinal,
        });
      }
    };
    r.onerror = (event) => {
      if (event.error === "no-speech" || event.error === "aborted") return;
      const fatal = FATAL.includes(event.error);
      if (fatal) wanted = false;
      onMessage({ kind: "error", error: event.error, fatal });
    };
    // Sessions end after pauses; start a fresh one at once so the next phrase
    // isn't clipped, but back off if the microphone keeps refusing to open.
    r.onend = () => {
      if (current !== r || !wanted) return;
      if (!heardAudio && ++stalls > MAX_STALLS) {
        wanted = false;
        onMessage({ kind: "error", error: "busy", fatal: true });
        return;
      }
      setTimeout(
        () => wanted && current === r && open(),
        heardAudio ? 0 : 250 * 2 ** stalls,
      );
    };
    current = r;
    r.start();
  };

  open();
  return () => {
    wanted = false;
    clearTimeout(watchdog);
    current?.stop();
  };
}
