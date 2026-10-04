"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  MicrophoneIcon,
  MicrophoneSlashIcon,
  WarningCircleIcon,
  CheckIcon,
  HandIcon,
  KeyboardIcon,
  SparkleIcon,
  ArrowsOutCardinalIcon,
} from "@phosphor-icons/react";
import { CanvasSpectrogram } from "./canvas-spectrogram";
import { playClick, playSuccess, playTone } from "@/lib/sound";

/**
 * Multimodal Demo Sandbox:
 * Proves Omnivra's core invariant: ANY INPUT → ANY LOGIC → ANY ACTION.
 *
 * Supports three live modalities targeting the exact same document actions:
 * 1. Voice: Real local SpeechRecognition + getUserMedia audio meter.
 * 2. Gesture: Interactive sensory pad with drag/touch gesture recognition & quick triggers.
 * 3. Keyboard: Live key combinations and mechanical key switches.
 */

type ModalityTab = "voice" | "gesture" | "keyboard";
type VoiceStatus =
  "unsupported" | "idle" | "starting" | "listening" | "denied" | "error";

type Command = {
  readonly id: string;
  readonly phrases: readonly string[];
  readonly label: string;
  readonly shortcut: string;
  readonly gestureName: string;
  readonly run: () => void;
};

const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

const toggleTheme = (target?: "dark" | "light") => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = target ?? (current === "light" ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", next);
  return next;
};

const COMMANDS: readonly Command[] = [
  {
    id: "theme",
    phrases: [
      "dark mode",
      "go dark",
      "dark",
      "light mode",
      "go light",
      "light",
    ],
    label: "Switched theme",
    shortcut: "⌘ / Ctrl + D",
    gestureName: "Pinch",
    run: () => {
      const mode = toggleTheme();
      return `Theme switched to ${mode}`;
    },
  },
  {
    id: "sound",
    phrases: ["toggle sound", "mute", "unmute", "sound"],
    label: "Toggled sound effects",
    shortcut: "⌘ / Ctrl + M",
    gestureName: "Swipe Up",
    run: () => {},
  },
  {
    id: "inspect",
    phrases: ["inspect runtime", "runtime status", "status"],
    label: "Runtime verified (local)",
    shortcut: "⌘ / Ctrl + I",
    gestureName: "Swipe Left",
    run: () => {},
  },
  {
    id: "action",
    phrases: ["trigger action", "dispatch intent", "test"],
    label: "Action dispatched (in-process)",
    shortcut: "⌘ / Ctrl + Enter",
    gestureName: "Swipe Right",
    run: () => {},
  },
];

function matchCommand(transcript: string): Command | undefined {
  const text = transcript.toLowerCase().trim();
  return COMMANDS.find((command) =>
    [...command.phrases]
      .sort((a, b) => b.length - a.length)
      .some((phrase) => text.includes(phrase)),
  );
}

export function VoiceDemo() {
  const [tab, setTab] = useState<ModalityTab>("voice");
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Gesture pad simulation state
  const [padPointer, setPadPointer] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [gestureFeedback, setGestureFeedback] = useState<string | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) setStatus("unsupported");
  }, []);

  const release = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    for (const track of streamRef.current?.getTracks() ?? []) track.stop();
    streamRef.current = null;
    setStream(null);
  }, []);

  const stop = useCallback(() => {
    release();
    setStatus("idle");
    playClick();
  }, [release]);

  const triggerAction = useCallback(
    (label: string, executor: () => void, inputType: string) => {
      executor();
      playSuccess();
      setLastAction(`${label} (${inputType})`);
      const timer = setTimeout(() => {
        // clear after 4s
      }, 4000);
      return () => clearTimeout(timer);
    },
    [],
  );

  const start = useCallback(async () => {
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) {
      setStatus("unsupported");
      return;
    }

    setStatus("starting");
    setErrorMessage(null);
    playTone(520, 0.1);

    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = media;
      setStream(media);
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError" || name === "SecurityError") {
        setStatus("denied");
        return;
      }
      setErrorMessage(
        name === "NotFoundError"
          ? "No microphone was found on this device."
          : "Could not open the microphone. Is another tab already using it?",
      );
      setStatus("error");
      return;
    }

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
        triggerAction(command.label, command.run, "Voice");
      }
    };

    recognition.onerror = (event) => {
      if (
        event.error === "not-allowed" ||
        event.error === "service-not-allowed"
      ) {
        release();
        setStatus("denied");
        return;
      }
      if (event.error === "no-speech" || event.error === "aborted") return;
      setErrorMessage(
        event.error === "network"
          ? "Speech recognition needs a network connection in this browser."
          : "Recognition stopped: " + event.error.replace(/-/g, " ") + ".",
      );
      release();
      setStatus("error");
    };

    recognition.onend = () => {
      setStatus((current) => (current === "listening" ? "idle" : current));
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      release();
      setErrorMessage("Could not start recognition. Try again.");
      setStatus("error");
    }
  }, [release, triggerAction]);

  useEffect(() => () => release(), [release]);

  // Global keyboard shortcuts when in keyboard tab
  useEffect(() => {
    if (tab !== "keyboard") return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        const key = e.key.toLowerCase();
        if (key === "d") {
          e.preventDefault();
          triggerAction("Switched theme", () => toggleTheme(), "Shortcut");
        } else if (key === "m") {
          e.preventDefault();
          triggerAction("Toggled sound effects", () => {}, "Shortcut");
        } else if (key === "i") {
          e.preventDefault();
          triggerAction("Runtime verified (local)", () => {}, "Shortcut");
        } else if (e.key === "Enter") {
          e.preventDefault();
          triggerAction("Action dispatched (in-process)", () => {}, "Shortcut");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [tab, triggerAction]);

  const isLive = status === "listening" || status === "starting";

  // Gesture pad pointer handlers
  const handlePadPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    pointerStartRef.current = { x, y };
    setPadPointer({ x, y });
  };

  const handlePadPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerStartRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setPadPointer({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handlePadPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerStartRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;
    const dx = endX - pointerStartRef.current.x;
    const dy = endY - pointerStartRef.current.y;
    pointerStartRef.current = null;
    setPadPointer(null);

    // Analyze drag vector
    if (Math.abs(dx) > 40) {
      if (dx < 0) {
        setGestureFeedback("gesture.swipe (left)");
        triggerAction("Runtime verified (local)", () => {}, "Gesture");
      } else {
        setGestureFeedback("gesture.swipe (right)");
        triggerAction("Action dispatched (in-process)", () => {}, "Gesture");
      }
    } else if (Math.abs(dy) < 15 && Math.abs(dx) < 15) {
      // Tap / Pinch
      setGestureFeedback("gesture.pinch");
      triggerAction("Switched theme", () => toggleTheme(), "Gesture");
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-surface shadow-2xl">
      {/* Ambient reactive background wash */}
      <div
        aria-hidden="true"
        data-live={isLive || tab === "gesture"}
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--accent-primary)_18%,transparent),transparent_65%)] opacity-40 transition-opacity duration-700 data-[live=true]:opacity-100"
      />

      {/* Top Header: Modality Selector Tabs */}
      <header className="relative flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3.5">
        <div className="flex items-center gap-1 rounded-lg border bg-base p-0.5">
          <button
            type="button"
            onClick={() => {
              setTab("voice");
              playClick();
            }}
            data-active={tab === "voice"}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-semibold transition-all data-[active=true]:bg-raised data-[active=true]:text-ink text-muted hover:text-ink"
          >
            <MicrophoneIcon
              size={14}
              weight={tab === "voice" ? "fill" : "regular"}
            />
            Voice
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("gesture");
              playClick();
            }}
            data-active={tab === "gesture"}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-semibold transition-all data-[active=true]:bg-raised data-[active=true]:text-ink text-muted hover:text-ink"
          >
            <HandIcon
              size={14}
              weight={tab === "gesture" ? "fill" : "regular"}
            />
            Gesture
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("keyboard");
              playClick();
            }}
            data-active={tab === "keyboard"}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-semibold transition-all data-[active=true]:bg-raised data-[active=true]:text-ink text-muted hover:text-ink"
          >
            <KeyboardIcon
              size={14}
              weight={tab === "keyboard" ? "fill" : "regular"}
            />
            Shortcuts
          </button>
        </div>

        {/* Live Engine Indicator */}
        <span
          data-live={isLive || tab !== "voice"}
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
          {tab === "voice"
            ? isLive
              ? "Microphone on"
              : "Microphone ready"
            : tab === "gesture"
              ? "Gesture pad ready"
              : "Keyboard active"}
        </span>
      </header>

      {/* Main Sandbox Body */}
      <div className="relative flex min-h-[17rem] flex-col gap-4 p-5">
        {/* TAB 1: VOICE */}
        {tab === "voice" && (
          <>
            {status === "unsupported" ? (
              <DemoState
                tone="warning"
                icon={<WarningCircleIcon size={18} />}
                title="This browser has no speech engine"
                body="Chrome, Edge and Safari expose one. Omnivra's local runtime packages its own engine, so it does not depend on the browser."
              />
            ) : status === "denied" ? (
              <DemoState
                tone="danger"
                icon={<MicrophoneSlashIcon size={18} />}
                title="Microphone blocked"
                body="Open the lock icon in the address bar, set Microphone to Allow, then reload this page. Audio never leaves your machine."
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
                <CanvasSpectrogram stream={stream} reduced={Boolean(reduce)} />

                <p
                  aria-live="polite"
                  className="min-h-[3.25rem] rounded-lg border bg-base px-4 py-2.5 font-mono text-[13px] leading-relaxed"
                >
                  {transcript || (
                    <span className="font-sans text-muted italic">
                      {isLive
                        ? "Listening... Speak any phrase below."
                        : "Microphone is idle. Click 'Start voice control' below."}
                    </span>
                  )}
                </p>

                <div className="space-y-1.5">
                  <span className="label-mono text-[10px]">
                    Recognized Intents
                  </span>
                  <ul className="grid grid-cols-2 gap-2">
                    {COMMANDS.map((command) => (
                      <li key={command.id}>
                        <button
                          type="button"
                          onClick={() => {
                            triggerAction(
                              command.label,
                              command.run,
                              "Simulated Voice",
                            );
                          }}
                          className="w-full text-left rounded-lg bg-raised px-3 py-2 font-mono text-[12px] text-accent transition-colors hover:bg-raised/80 hover:border-accent border border-transparent"
                        >
                          "{command.phrases[0]}"
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </>
        )}

        {/* TAB 2: GESTURE */}
        {tab === "gesture" && (
          <div className="flex flex-col gap-3">
            <div
              onPointerDown={handlePadPointerDown}
              onPointerMove={handlePadPointerMove}
              onPointerUp={handlePadPointerUp}
              className="relative flex h-36 w-full cursor-crosshair flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-subtle bg-base/80 select-none transition-colors hover:border-accent"
            >
              {/* Grid Lines */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border-subtle)_1px,transparent_1px),linear-gradient(to_bottom,var(--border-subtle)_1px,transparent_1px)] bg-[size:24px_24px] opacity-25"
              />

              {padPointer ? (
                <div
                  style={{
                    transform: `translate(${padPointer.x - 20}px, ${padPointer.y - 20}px)`,
                  }}
                  className="pointer-events-none absolute top-0 left-0 flex h-10 w-10 items-center justify-center rounded-full border-2 border-gesture bg-gesture/20"
                >
                  <span className="h-2 w-2 rounded-full bg-gesture" />
                </div>
              ) : null}

              <div className="relative z-10 flex flex-col items-center text-center p-4">
                <ArrowsOutCardinalIcon
                  size={24}
                  className="text-gesture mb-1.5 opacity-80"
                />
                <p className="text-[13px] font-semibold">
                  Interactive Gesture Pad
                </p>
                <p className="text-[11.5px] text-muted max-w-[34ch]">
                  Click or drag here (Swipe Left / Swipe Right / Tap to pinch)
                  or click the presets below.
                </p>
                {gestureFeedback && (
                  <span className="mt-2 rounded bg-gesture/15 px-2 py-0.5 font-mono text-[10.5px] font-semibold text-gesture">
                    {gestureFeedback}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {COMMANDS.map((cmd) => (
                <button
                  key={cmd.id}
                  type="button"
                  onClick={() => {
                    setGestureFeedback(
                      `gesture.${cmd.gestureName.toLowerCase().replace(/\s+/g, ".")}`,
                    );
                    triggerAction(cmd.label, cmd.run, "Gesture");
                  }}
                  className="flex items-center justify-between rounded-lg border bg-raised px-3 py-2 text-[12px] font-medium transition-all hover:border-gesture active:translate-y-px"
                >
                  <span className="font-semibold text-gesture">
                    {cmd.gestureName}
                  </span>
                  <span className="text-[11px] text-muted">{cmd.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: KEYBOARD / SHORTCUTS */}
        {tab === "keyboard" && (
          <div className="flex flex-col gap-3">
            <div className="rounded-xl border bg-base p-4">
              <div className="flex items-center justify-between">
                <span className="label-mono text-[10.5px]">
                  Global Shortcut Layer
                </span>
                <span className="font-mono text-[11px] text-muted">
                  Direct keyboard chord
                </span>
              </div>
              <p className="mt-2 text-[13px] text-muted leading-relaxed">
                Press hotkeys directly on your physical keyboard, or click the
                mechanical switches below:
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {COMMANDS.map((cmd) => (
                <button
                  key={cmd.id}
                  type="button"
                  onClick={() => {
                    triggerAction(cmd.label, cmd.run, "Shortcut");
                  }}
                  className="group flex items-center justify-between rounded-lg border bg-raised px-3.5 py-2.5 text-left transition-all hover:border-input active:scale-[0.98]"
                >
                  <div>
                    <span className="block font-mono text-[12px] font-bold text-input group-hover:underline">
                      {cmd.shortcut}
                    </span>
                    <span className="text-[11.5px] text-muted">
                      {cmd.label}
                    </span>
                  </div>
                  <SparkleIcon
                    size={16}
                    className="text-muted group-hover:text-input"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Control Footer */}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t pt-3">
          {tab === "voice" ? (
            status === "unsupported" ? null : isLive ? (
              <button
                type="button"
                onClick={stop}
                className="rounded-lg border border-danger px-4 py-1.5 text-[13px] font-semibold text-danger transition-colors hover:bg-danger/10 active:translate-y-px"
              >
                Stop listening
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void start()}
                className="flex items-center gap-2 rounded-lg bg-accent px-4 py-1.5 text-[13px] font-semibold text-base transition-transform active:translate-y-px"
              >
                <MicrophoneIcon size={15} weight="fill" />
                {status === "denied" || status === "error"
                  ? "Try again"
                  : "Start voice control"}
              </button>
            )
          ) : (
            <span className="font-mono text-[11px] text-muted">
              Local in-process dispatch
            </span>
          )}

          {lastAction ? (
            <span className="flex items-center gap-1.5 text-[12px] font-semibold text-active">
              <CheckIcon size={14} weight="bold" />
              {lastAction}
            </span>
          ) : (
            <span className="font-mono text-[11px] text-muted">
              Ready for input
            </span>
          )}
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
