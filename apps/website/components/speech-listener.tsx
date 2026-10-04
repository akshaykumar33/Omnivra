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
    let session = 0;

    const start = (lang: string) => {
      recognition?.abort();
      const r = new Recognition();
      r.continuous = true;
      r.interimResults = true;
      r.maxAlternatives = 5;
      r.lang = lang;
      r.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (!result) continue;
          post({
            kind: "result",
            // Unique across restarts so the extension can tell phrases apart.
            id: `${session}:${i}`,
            alternatives: Array.from(result, (alt) => alt.transcript.trim()),
            isFinal: result.isFinal,
          });
        }
      };
      r.onerror = (event) => {
        if (event.error === "no-speech" || event.error === "aborted") return;
        post({ kind: "error", error: event.error });
        if (
          ["not-allowed", "service-not-allowed", "audio-capture"].includes(
            event.error,
          )
        )
          wanted = false;
      };
      // Browsers end sessions after silence; keep listening until told to stop.
      r.onend = () => {
        if (wanted) {
          session++;
          r.start();
        } else post({ kind: "state", listening: false });
      };
      recognition = r;
      wanted = true;
      r.start();
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
