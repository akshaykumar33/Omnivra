"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  MicrophoneIcon,
  MicrophoneSlashIcon,
  WarningCircleIcon,
  CheckIcon,
} from "@phosphor-icons/react";

/**
 * A live demonstration rather than a picture of one.
 *
 * Omnivra's claim is that any input can drive any action, so the honest way to
 * show that on a landing page is to let the page itself be the target: the
 * commands below genuinely change this document. Nothing here is mocked, and
 * the microphone is only ever opened from an explicit click.
 */

type Status =
  "unsupported" | "idle" | "starting" | "listening" | "denied" | "error";

type Command = {
  readonly phrases: readonly string[];
  readonly label: string;
  readonly run: () => void;
};

const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

const COMMANDS: readonly Command[] = [
  {
    phrases: ["dark mode", "go dark", "dark"],
    label: "Switched to dark",
    run: () => document.documentElement.setAttribute("data-theme", "dark"),
  },
  {
    phrases: ["light mode", "go light", "light"],
    label: "Switched to light",
    run: () => document.documentElement.setAttribute("data-theme", "light"),
  },
  {
    phrases: ["show me the inputs", "the inputs", "inputs"],
    label: "Jumped to inputs",
    run: () => scrollToSection("inputs"),
  },
  {
    phrases: ["back to top", "go to top", "top"],
    label: "Back to top",
    run: () => window.scrollTo({ top: 0, behavior: "smooth" }),
  },
];

function matchCommand(transcript: string): Command | undefined {
  const text = transcript.toLowerCase().trim();
  // Longest phrase first, so "dark mode" wins over the bare "dark".
  return COMMANDS.find((command) =>
    [...command.phrases]
      .sort((a, b) => b.length - a.length)
      .some((phrase) => text.includes(phrase)),
  );
}

export function VoiceDemo() {
  const [status, setStatus] = useState<Status>("idle");
  const [transcript, setTranscript] = useState("");
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) setStatus("unsupported");
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setStatus("idle");
  }, []);

  const start = useCallback(() => {
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) {
      setStatus("unsupported");
      return;
    }

    setStatus("starting");
    setErrorMessage(null);

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => setStatus("listening");

    recognition.onresult = (event) => {
      let text = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (!result) continue;
        const alternative = result[0];
        if (alternative) text += alternative.transcript;
      }
      setTranscript(text);

      const command = matchCommand(text);
      if (command) {
        command.run();
        setLastAction(command.label);
      }
    };

    recognition.onerror = (event) => {
      if (
        event.error === "not-allowed" ||
        event.error === "service-not-allowed"
      ) {
        setStatus("denied");
        return;
      }
      if (event.error === "no-speech" || event.error === "aborted") return;
      setErrorMessage(
        event.error === "network"
          ? "Speech recognition needs a network connection in this browser."
          : "Recognition stopped: " + event.error.replace(/-/g, " ") + ".",
      );
      setStatus("error");
    };

    recognition.onend = () => {
      // Chromium ends the session on silence; only reflect that if we did not stop.
      setStatus((current) => (current === "listening" ? "idle" : current));
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      setErrorMessage(
        "Could not start the microphone. Is another tab already using it?",
      );
      setStatus("error");
    }
  }, []);

  // Release the microphone if this unmounts mid-session.
  useEffect(() => () => recognitionRef.current?.abort(), []);

  const isLive = status === "listening" || status === "starting";

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-surface">
      <header className="flex items-center justify-between gap-3 border-b px-5 py-4">
        <span className="label-mono">Live, in this browser</span>
        <span
          data-live={isLive}
          className="flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold text-muted data-[live=true]:border-active data-[live=true]:text-active"
        >
          <span className="relative flex h-1.5 w-1.5">
            {isLive && !reduce ? (
              <motion.span
                className="absolute inset-0 rounded-full bg-current"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ) : (
              <span className="absolute inset-0 rounded-full bg-current" />
            )}
          </span>
          {isLive ? "Microphone on" : "Microphone off"}
        </span>
      </header>

      <div className="flex min-h-[13rem] flex-col gap-4 p-5">
        {status === "unsupported" ? (
          <DemoState
            tone="warning"
            icon={<WarningCircleIcon size={18} />}
            title="This browser has no speech engine"
            body="Chrome, Edge and Safari expose one. The Omnivra extension ships its own local engine, so it does not depend on the browser having one."
          />
        ) : status === "denied" ? (
          <DemoState
            tone="danger"
            icon={<MicrophoneSlashIcon size={18} />}
            title="Microphone blocked"
            body="Open the lock icon in the address bar, set Microphone to Allow, then reload this page. Audio never leaves your machine either way."
          />
        ) : status === "error" ? (
          <DemoState
            tone="danger"
            icon={<WarningCircleIcon size={18} />}
            title="Recognition stopped"
            body={errorMessage ?? "Something interrupted the microphone."}
          />
        ) : (
          <>
            <p
              aria-live="polite"
              className="min-h-[3.5rem] rounded-lg border bg-base px-4 py-3 font-mono text-[13px] leading-relaxed"
            >
              {transcript || (
                <span className="font-sans italic text-muted">
                  {isLive
                    ? "Listening. Say one of the commands below."
                    : "Nothing captured yet."}
                </span>
              )}
            </p>

            <ul className="grid grid-cols-2 gap-2">
              {COMMANDS.map((command) => (
                <li
                  key={command.label}
                  className="rounded-lg bg-raised px-3 py-2 font-mono text-[12px] text-accent"
                >
                  {command.phrases[0]}
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="mt-auto flex items-center justify-between gap-3">
          {status === "unsupported" ? null : isLive ? (
            <button
              type="button"
              onClick={stop}
              className="rounded-lg border border-danger px-4 py-2 text-[13px] font-semibold text-danger transition-colors hover:bg-danger/10 active:translate-y-px"
            >
              Stop listening
            </button>
          ) : (
            <button
              type="button"
              onClick={start}
              className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-[13px] font-semibold text-base transition-transform active:translate-y-px"
            >
              <MicrophoneIcon size={16} weight="fill" />
              {status === "denied" || status === "error"
                ? "Try again"
                : "Try voice control"}
            </button>
          )}

          {lastAction ? (
            <span className="flex items-center gap-1.5 text-[12px] font-medium text-active">
              <CheckIcon size={14} weight="bold" />
              {lastAction}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function DemoState({
  tone,
  icon,
  title,
  body,
}: {
  tone: "warning" | "danger";
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  const edge = tone === "danger" ? "border-danger/40" : "border-warning/40";
  const ink = tone === "danger" ? "text-danger" : "text-warning";
  return (
    <div className={"flex gap-3 rounded-lg border px-4 py-3 " + edge}>
      <span className={ink}>{icon}</span>
      <div className="space-y-1">
        <p className="text-[13px] font-semibold">{title}</p>
        <p className="text-[12.5px] leading-relaxed text-muted">{body}</p>
      </div>
    </div>
  );
}
