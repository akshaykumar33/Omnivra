"use client";

import { useEffect, useState } from "react";

/*
 * Speech recognition for the Omnivra browser extension.
 *
 * Browsers return no transcripts to speech recognition started inside an
 * extension page, so the extension's side panel embeds this page in a hidden
 * iframe and drives it with postMessage. Messages are only exchanged with a
 * parent whose origin is a browser extension.
 *
 * Opened directly in a tab, the page instead asks for microphone access,
 * which a side panel cannot prompt for.
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

function parentExtensionOrigin(): string | undefined {
  if (window.parent === window) return undefined;
  const origin = window.location.ancestorOrigins?.[0];
  return origin && EXTENSION_ORIGIN.test(origin) ? origin : undefined;
}

export function SpeechListener() {
  const [embedded, setEmbedded] = useState<boolean | null>(null);
  const [mic, setMic] = useState<"unknown" | "granted" | "denied">("unknown");

  useEffect(() => {
    const parentOrigin = parentExtensionOrigin();
    setEmbedded(Boolean(parentOrigin));
    if (!parentOrigin) return;

    const post = (message: Record<string, unknown>) =>
      window.parent.postMessage(
        { source: "omnivra-listener", ...message },
        parentOrigin,
      );

    const Recognition =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Recognition) {
      post({ kind: "error", error: "unsupported" });
      return;
    }

    let recognition: SpeechRecognition | undefined;
    let wanted = false;
    let lang = "en-US";
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

    const start = (language: string) => {
      lang = language;
      wanted = true;
      failures = 0;
      stalls = 0;
      const previous = recognition;
      recognition = undefined;
      previous?.abort();
      open();
      post({ kind: "state", listening: true });
    };

    const onMessage = (event: MessageEvent<Command>) => {
      if (
        event.origin !== parentOrigin ||
        event.data?.type !== "omnivra-listen"
      )
        return;
      if (event.data.action === "start") start(event.data.lang ?? "en-US");
      if (event.data.action === "stop") {
        wanted = false;
        recognition?.stop();
      }
    };
    window.addEventListener("message", onMessage);
    post({ kind: "ready" });
    return () => {
      wanted = false;
      recognition?.abort();
      window.removeEventListener("message", onMessage);
    };
  }, []);

  const allow = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setMic("granted");
    } catch {
      setMic("denied");
    }
  };

  if (embedded !== false) return null;

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
      {mic === "granted" ? (
        <p role="status">
          Microphone allowed. Close this tab and click{" "}
          <strong>Start listening</strong> in the Omnivra side panel.
        </p>
      ) : (
        <>
          <p style={{ marginBottom: "1.5rem" }}>
            The Omnivra extension listens through this page, so it needs
            microphone access here once. Audio goes to your browser&apos;s
            speech recognition; Omnivra stores nothing.
          </p>
          <button
            type="button"
            onClick={allow}
            style={{
              padding: "0.75rem 1.25rem",
              borderRadius: "var(--radius-control)",
              border: 0,
              background: "var(--accent-primary)",
              color: "var(--bg-base)",
              font: "inherit",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Allow microphone
          </button>
          {mic === "denied" && (
            <p
              role="alert"
              style={{ marginTop: "1rem", color: "var(--status-danger)" }}
            >
              The microphone is blocked. Allow it from the icon in the address
              bar, then try again.
            </p>
          )}
        </>
      )}
    </main>
  );
}
