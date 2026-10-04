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
 * Microphone permission belongs to the embedding page (the extension), so the
 * extension asks for it; opened directly, this page only explains itself.
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

    const onMessage = (event: MessageEvent<Command>) => {
      if (
        event.origin !== parentOrigin ||
        event.data?.type !== "omnivra-listen"
      )
        return;
      if (event.data.action === "start") void start(event.data.lang ?? "en-US");
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

  if (embedded !== false) return null;

  // Opened directly. Microphone access is granted to the extension (it embeds
  // this page), so there is nothing to allow here.
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
