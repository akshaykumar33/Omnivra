"use client";

import { useEffect, useState } from "react";

/*
 * Speech recognition for the Omnivra browser extension.
 *
 * Browsers return no transcripts to speech recognition started inside an
 * extension page, so recognition runs here and results go to the extension:
 *  - preferably in a pinned background tab the extension opens, where the
 *    browser's fast on-device engine is allowed (it is not in iframes);
 *  - otherwise embedded in the side panel as a hidden iframe (online engine).
 * Messages are only exchanged with a browser extension: an iframe parent with
 * an extension origin, or the extension named in ?ext= over its own port.
 *
 * Opened directly by a person, the page only explains itself.
 */

type Command = {
  type: "omnivra-listen";
  action: "start" | "stop";
  lang?: string;
};

// Sessions in a row that may end without audio before listening gives up.
const MAX_STALLS = 5;

// Errors that retrying won't fix.
const FATAL = ["not-allowed", "service-not-allowed", "audio-capture"];

// Chromium extension IDs are 32 letters a–p. Edge uses the same scheme.
const EXTENSION_ORIGIN = /^chrome-extension:\/\/[a-p]{32}$/;

const EXTENSION_ID = /^[a-p]{32}$/;

// The parts of the extension messaging API a web page can use once the
// extension lists it under externally_connectable.
interface ExtensionPort {
  postMessage(message: unknown): void;
  onMessage: { addListener(listener: (message: Command) => void): void };
  onDisconnect: { addListener(listener: () => void): void };
  disconnect(): void;
}
declare const chrome:
  | {
      runtime?: {
        connect?(extensionId: string, info: { name: string }): ExtensionPort;
      };
    }
  | undefined;

async function microphoneAllowed(): Promise<boolean> {
  try {
    const { state } = await navigator.permissions.query({
      name: "microphone" as PermissionName,
    });
    return state === "granted";
  } catch {
    return false;
  }
}

function parentExtensionOrigin(): string | undefined {
  if (window.parent === window) return undefined;
  const origin = window.location.ancestorOrigins?.[0];
  return origin && EXTENSION_ORIGIN.test(origin) ? origin : undefined;
}

// How this page talks to the extension:
//  - embedded in the side panel: postMessage with the parent;
//  - opened by the extension as a pinned tab (?ext=<id>): an extension port.
// Running in a tab lets the browser's fast on-device engine work, which it
// refuses inside extension pages and cross-origin iframes.
interface Transport {
  /** A top-level tab, which can show the browser's microphone prompt. */
  inTab: boolean;
  send(message: Record<string, unknown>): void;
  listen(handler: (command: Command) => void): void;
  close(): void;
}

function connectTransport(): Transport | undefined {
  const parentOrigin = parentExtensionOrigin();
  if (parentOrigin) {
    let handler: ((command: Command) => void) | undefined;
    const onMessage = (event: MessageEvent<Command>) => {
      if (event.origin !== parentOrigin) return;
      if (event.data?.type === "omnivra-listen") handler?.(event.data);
    };
    window.addEventListener("message", onMessage);
    return {
      inTab: false,
      send: (message) =>
        window.parent.postMessage(
          { source: "omnivra-listener", ...message },
          parentOrigin,
        ),
      listen: (h) => (handler = h),
      close: () => window.removeEventListener("message", onMessage),
    };
  }

  const extensionId = new URLSearchParams(location.search).get("ext") ?? "";
  if (!EXTENSION_ID.test(extensionId) || !chrome?.runtime?.connect) return;
  let port: ExtensionPort;
  try {
    port = chrome.runtime.connect(extensionId, { name: "omnivra-voice" });
  } catch {
    return undefined;
  }
  return {
    inTab: true,
    send: (message) =>
      port.postMessage({ source: "omnivra-listener", ...message }),
    listen: (h) => {
      port.onMessage.addListener((command) => {
        if (command?.type === "omnivra-listen") h(command);
      });
      // The extension went away (reloaded, panel closed): stop listening.
      port.onDisconnect.addListener(() =>
        h({ type: "omnivra-listen", action: "stop" }),
      );
    },
    close: () => port.disconnect(),
  };
}

export function SpeechListener() {
  const [connected, setConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const transport = connectTransport();
    setConnected(Boolean(transport));
    if (!transport) return;
    const post = transport.send;

    const Recognition =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Recognition) {
      post({ kind: "error", error: "unsupported" });
      return;
    }

    let recognition: SpeechRecognition | undefined;
    let wanted = false;
    let lang = "en-US";
    // On-device recognition: faster, works offline, and audio stays local.
    let onDevice = false;
    let session = 0;
    // Consecutive transient failures (e.g. "network"); reset by any result.
    let failures = 0;
    // Consecutive sessions that ended without capturing any audio.
    let stalls = 0;

    // Browsers end a session after a result or a pause, and restarting the
    // same object is unreliable (Edge stops delivering results), so every
    // session gets a fresh recognizer.
    const open = () => {
      const r = new Recognition();
      const id = ++session;
      r.continuous = true;
      r.interimResults = true;
      r.maxAlternatives = 5;
      r.lang = lang;
      if (onDevice) r.processLocally = true;
      r.onresult = (event) => {
        failures = 0;
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (!result) continue;
          post({
            kind: "result",
            // Unique across sessions so the extension can tell phrases apart.
            id: `${id}:${i}`,
            alternatives: Array.from(result, (alt) => alt.transcript.trim()),
            isFinal: result.isFinal,
          });
        }
      };
      r.onerror = (event) => {
        if (event.error === "no-speech" || event.error === "aborted") return;
        // The on-device model can't take this language; fall back to the
        // browser's online service and keep listening.
        if (onDevice && event.error === "language-not-supported") {
          onDevice = false;
          post({ kind: "state", listening: true, engine: "cloud" });
          return;
        }
        const fatal =
          FATAL.includes(event.error) ||
          (event.error === "network" && ++failures > 3);
        if (fatal) wanted = false;
        post({ kind: "error", error: event.error, fatal });
      };
      // Session boundaries, for diagnosing gaps in which speech is lost.
      let heardAudio = false;
      r.onaudiostart = () => {
        heardAudio = true;
        stalls = 0;
        post({ kind: "session", event: "audiostart", id });
      };
      r.onend = () => {
        post({ kind: "session", event: "end", id });
        if (recognition !== r) return;
        if (!wanted) return post({ kind: "state", listening: false });
        // A session that ends before any audio means the microphone or the
        // speech service is unavailable (e.g. another recognizer holds it).
        // Restarting at once would spin hundreds of times a second, so back
        // off, and give up after a few tries.
        if (!heardAudio && ++stalls > MAX_STALLS) {
          wanted = false;
          post({ kind: "error", error: "busy", fatal: true });
          return post({ kind: "state", listening: false });
        }
        const delay = heardAudio
          ? failures * 500 // restart at once so the next phrase isn't clipped
          : 250 * 2 ** stalls;
        setTimeout(() => wanted && recognition === r && open(), delay);
      };
      recognition = r;
      r.start();
    };

    const start = async (language: string) => {
      lang = language;
      wanted = true;
      failures = 0;
      stalls = 0;
      const previous = recognition;
      recognition = undefined;
      previous?.abort();
      // In a tab, the microphone is this site's to ask for. The first time,
      // tell the extension so it can bring this tab forward for the prompt.
      if (transport.inTab && !(await microphoneAllowed())) {
        post({ kind: "needs-permission" });
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          stream.getTracks().forEach((track) => track.stop());
          post({ kind: "permission-ok" });
        } catch {
          wanted = false;
          post({ kind: "error", error: "not-allowed", fatal: true });
          return;
        }
      }
      onDevice = await deviceModelReady(language);
      if (!wanted) return;
      open();
      post({
        kind: "state",
        listening: true,
        engine: onDevice ? "device" : "cloud",
      });
    };

    // Use an installed on-device model when there is one; otherwise start a
    // download for next time and use the online service meanwhile.
    const deviceModelReady = async (language: string) => {
      if (!Recognition.available) return false;
      const options = { langs: [language], processLocally: true };
      try {
        const status = await Recognition.available(options);
        if (status === "available") return true;
        if (status === "downloadable")
          Recognition.install?.(options).catch(() => {});
      } catch {
        // Unsupported option or language: use the online service.
      }
      return false;
    };

    transport.listen((command) => {
      if (command.action === "start") void start(command.lang ?? "en-US");
      if (command.action === "stop") {
        wanted = false;
        recognition?.stop();
      }
    });
    post({ kind: "ready" });
    return () => {
      wanted = false;
      recognition?.abort();
      transport.close();
    };
  }, []);

  if (connected === null) return null;

  if (connected) {
    // Pinned tab opened by the extension (an embedded copy is hidden anyway).
    return (
      <main
        id="main"
        style={{
          maxWidth: "36rem",
          margin: "0 auto",
          padding: "clamp(3rem, 8vw, 6rem) 1rem",
          color: "var(--text-primary)",
          lineHeight: 1.6,
        }}
      >
        <h1 style={{ fontSize: "var(--text-headline)", marginBottom: "1rem" }}>
          Omnivra is listening
        </h1>
        <p>
          This tab hears your voice commands. It closes by itself when you click{" "}
          <strong>Stop listening</strong> in the side panel.
        </p>
      </main>
    );
  }

  // Opened directly, not by the extension.
  return (
    <main
      id="main"
      style={{
        maxWidth: "36rem",
        margin: "0 auto",
        padding: "clamp(3rem, 8vw, 6rem) 1rem",
        color: "var(--text-primary)",
        lineHeight: 1.6,
      }}
    >
      <h1 style={{ fontSize: "var(--text-headline)", marginBottom: "1rem" }}>
        Omnivra voice
      </h1>
      <p>
        This page does speech recognition for the Omnivra browser extension and
        only works inside its side panel. To use voice, open the side panel and
        click <strong>Start listening</strong>. You can close this tab.
      </p>
    </main>
  );
}
