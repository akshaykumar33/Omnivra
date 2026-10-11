"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { OmnivraKernel } from "@omnivra/core";
import type {
  ActionDescriptor,
  ActionResult,
  HostAdapter,
  OmnivraEvent,
  OmnivraRule,
} from "@omnivra/types";
import {
  Keyboard,
  Gamepad2,
  MousePointer,
  Zap,
  CheckCircle2,
  Ban,
  Sparkles,
} from "lucide-react";
import { playClick, playSuccess, playTone } from "@/lib/sound";
import { IconBadge } from "./ui/icon-badge";

/**
 * The Interactive Engine Bench:
 * Imports the real @omnivra/core kernel and lets the visitor drive real-time
 * multimodal event dispatch with keyboard, gamepad, pointer or interactive triggers.
 */

type TriggerChoice = {
  id: string;
  label: string;
  eventType: string;
  hint: string;
};

const TRIGGERS: readonly TriggerChoice[] = [
  {
    id: "any",
    label: "Any input",
    eventType: "*",
    hint: "Universal trigger: fires on key chords, clicks, and pointer gestures.",
  },
  {
    id: "hotkey",
    label: "Key or controller",
    eventType: "hotkey",
    hint: "Matches physical keyboard chords and gamepad buttons equally.",
  },
  {
    id: "flick",
    label: "Pointer gesture",
    eventType: "pointer.flick",
    hint: "Directional vector gesture read from pointer movement.",
  },
];

type ActionChoice = {
  id: string;
  label: string;
  type: string;
  capability: string;
  payload?: Record<string, unknown>;
};

const ACTIONS: readonly ActionChoice[] = [
  {
    id: "theme",
    label: "Toggle theme",
    type: "theme.toggle",
    capability: "ui.theme",
  },
  {
    id: "notify",
    label: "Emit runtime ping",
    type: "runtime.notify",
    capability: "runtime.event",
    payload: { status: "dispatched", origin: "omnivra.bench" },
  },
  {
    id: "tone",
    label: "Play audio tone",
    type: "audio.tone",
    capability: "audio.play",
    payload: { frequency: 523.25 },
  },
];

const ACTIVE_APP = "browser";

type FeedEntry = {
  key: string;
  event: OmnivraEvent;
  matched: boolean;
};

const INITIAL_FEED: readonly FeedEntry[] = [
  {
    key: "init-1",
    matched: true,
    event: {
      id: "evt_91a0_hotkey",
      type: "hotkey",
      source: "keyboard",
      timestamp: Date.now() - 2500,
      confidence: 1,
      context: { activeApp: ACTIVE_APP, timestamp: Date.now() - 2500 },
      payload: { chord: "Space", device: "switch_matrix" },
    },
  },
  {
    key: "init-2",
    matched: true,
    event: {
      id: "evt_84b2_gesture",
      type: "pointer.flick",
      source: "mouse",
      timestamp: Date.now() - 6200,
      confidence: 1,
      context: { activeApp: ACTIVE_APP, timestamp: Date.now() - 6200 },
      payload: { direction: "right", distance: 48 },
    },
  },
  {
    key: "init-3",
    matched: true,
    event: {
      id: "evt_73c1_chord",
      type: "hotkey",
      source: "keyboard",
      timestamp: Date.now() - 11800,
      confidence: 1,
      context: { activeApp: ACTIVE_APP, timestamp: Date.now() - 11800 },
      payload: { chord: "Cmd + K", device: "keyboard" },
    },
  },
];

export function Bench() {
  const kernelRef = useRef<OmnivraKernel | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const padRef = useRef<HTMLButtonElement>(null);

  const [triggerId, setTriggerId] = useState<string>("any");
  const [actionId, setActionId] = useState<string>("theme");
  const [feed, setFeed] = useState<FeedEntry[]>([...INITIAL_FEED]);
  const [gamepad, setGamepad] = useState<string | null>(null);
  const [armed, setArmed] = useState(false);

  const trigger = TRIGGERS.find((t) => t.id === triggerId) ?? TRIGGERS[0]!;
  const action = ACTIONS.find((a) => a.id === actionId) ?? ACTIONS[0]!;

  const rule: OmnivraRule = {
    id: "bench-rule",
    name: "Bench rule",
    enabled: true,
    priority: 1,
    trigger: { type: "hotkey", name: trigger.eventType },
    actions: [
      {
        id: `${action.id}-action`,
        type: action.type,
        capabilityRequired: action.capability,
        ...(action.payload ? { payload: action.payload } : {}),
      },
    ],
  };

  useEffect(() => {
    const kernel = new OmnivraKernel();
    kernelRef.current = kernel;

    const pulse = () => {
      const node = panelRef.current;
      if (!node) return;
      node.animate(
        [
          {
            boxShadow:
              "0 0 0 0 color-mix(in srgb, var(--accent-primary) 60%, transparent)",
          },
          { boxShadow: "0 0 0 16px transparent" },
        ],
        { duration: 500, easing: "cubic-bezier(0.16,1,0.3,1)" },
      );
    };

    const adapter: HostAdapter = {
      id: "web-page",
      name: "This page",
      capabilities: ["ui.theme", "runtime.event", "audio.play"],
      initialize: async () => {},
      shutdown: async () => {},
      supports: (type) =>
        ["theme.toggle", "runtime.notify", "audio.tone"].includes(type),
      execute: async (descriptor: ActionDescriptor): Promise<ActionResult> => {
        pulse();
        try {
          if (descriptor.type === "theme.toggle") {
            const root = document.documentElement;
            const explicit = root.getAttribute("data-theme");
            const current =
              explicit ??
              (window.matchMedia("(prefers-color-scheme: light)").matches
                ? "light"
                : "dark");
            const next = current === "light" ? "dark" : "light";
            root.setAttribute("data-theme", next);
            return { success: true, actionId: descriptor.id, output: next };
          }

          if (descriptor.type === "runtime.notify") {
            playSuccess();
            return {
              success: true,
              actionId: descriptor.id,
              output: "Dispatched in local process",
            };
          }

          if (descriptor.type === "audio.tone") {
            playTone(Number(descriptor.payload?.frequency ?? 440), 0.16);
            return { success: true, actionId: descriptor.id };
          }

          return {
            success: false,
            actionId: descriptor.id,
            error: `Unhandled action type: ${descriptor.type}`,
          };
        } catch (error) {
          return {
            success: false,
            actionId: descriptor.id,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
    };

    kernel.registerAdapter(adapter);
    void kernel.initialize();

    return () => {
      kernelRef.current = null;
    };
  }, []);

  useEffect(() => {
    const kernel = kernelRef.current;
    if (!kernel) return;
    kernel.ruleEvaluator.registerRule(rule);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(rule)]);

  const publish = useCallback(
    (type: string, source: OmnivraEvent["source"], payload: unknown) => {
      const kernel = kernelRef.current;
      if (!kernel) return;

      const event: OmnivraEvent = {
        id: crypto.randomUUID().slice(0, 8),
        type,
        source,
        timestamp: Date.now(),
        confidence: 1,
        context: { activeApp: ACTIVE_APP, timestamp: Date.now() },
        payload,
      };

      const matchedActions = kernel.ruleEvaluator.evaluate(event);
      kernel.eventBus.publish(event);

      setFeed((prev) =>
        [
          {
            key: event.id,
            event,
            matched: matchedActions.length > 0,
          },
          ...prev,
        ].slice(0, 5),
      );
    },
    [],
  );

  const onPadKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") return;
    e.preventDefault();
    const chord = [
      e.ctrlKey && "Ctrl",
      e.metaKey && "Meta",
      e.altKey && "Alt",
      e.shiftKey && "Shift",
      e.key.length === 1 ? e.key.toUpperCase() : e.key,
    ]
      .filter(Boolean)
      .join(" + ");
    playClick();
    publish("hotkey", "keyboard", { chord, device: "physical_keyboard" });
  };

  // Gamepad listener
  useEffect(() => {
    let raf = 0;
    let previous: boolean[] = [];

    const poll = () => {
      const pads = navigator.getGamepads?.() ?? [];
      for (const pad of pads) {
        if (!pad) continue;
        pad.buttons.forEach((button, index) => {
          if (button.pressed && !previous[index]) {
            publish("hotkey", "keyboard", {
              chord: `Button ${index}`,
              device: "gamepad",
            });
          }
        });
        previous = pad.buttons.map((b) => b.pressed);
        break;
      }
      raf = requestAnimationFrame(poll);
    };

    const onConnect = (e: GamepadEvent) => {
      setGamepad(e.gamepad.id);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(poll);
    };
    const onDisconnect = () => {
      setGamepad(null);
      cancelAnimationFrame(raf);
    };

    window.addEventListener("gamepadconnected", onConnect);
    window.addEventListener("gamepaddisconnected", onDisconnect);

    const existing = (navigator.getGamepads?.() ?? []).find(Boolean);
    if (existing) {
      setGamepad(existing.id);
      raf = requestAnimationFrame(poll);
    }

    return () => {
      window.removeEventListener("gamepadconnected", onConnect);
      window.removeEventListener("gamepaddisconnected", onDisconnect);
      cancelAnimationFrame(raf);
    };
  }, [publish]);

  // Pointer flick vector tracking
  const flickStart = useRef<{ x: number; y: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    flickStart.current = { x: e.clientX, y: e.clientY };
    setArmed(true);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const start = flickStart.current;
    flickStart.current = null;
    setArmed(false);
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.hypot(dx, dy) < 20) return;
    const direction =
      Math.abs(dx) > Math.abs(dy)
        ? dx > 0
          ? "right"
          : "left"
        : dy > 0
          ? "down"
          : "up";
    playClick();
    publish("pointer.flick", "mouse", {
      direction,
      distance: Math.round(Math.hypot(dx, dy)),
    });
  };

  return (
    <section
      id="bench"
      aria-labelledby="bench-heading"
      className="mx-auto max-w-[1400px] px-6 py-12 lg:py-16"
    >
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="label-mono">Kernel Playground</p>
          <h2
            id="bench-heading"
            className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl text-ink"
          >
            Run the engine with live hardware.
          </h2>
        </div>
        <p className="max-w-[48ch] text-[13.5px] leading-relaxed text-muted">
          This playground executes the real in-memory{" "}
          <code className="font-mono text-accent">@omnivra/core</code> kernel.
          Configure a rule, click hardware switches or press keys, and watch
          live event evaluation.
        </p>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr] items-stretch">
        {/* Left: Interactive Rule Composer & Hardware Triggers */}
        <div
          ref={panelRef}
          className="flex h-full flex-col justify-between rounded-xl border border-subtle/80 bg-surface/90 p-5 shadow-sm"
        >
          <div>
            <div className="flex items-center justify-between border-b border-subtle/70 pb-3">
              <span className="label-mono">Rule Configuration</span>
              <span className="font-mono text-[11px] text-accent">
                Evaluator: Active
              </span>
            </div>

            {/* Segmented Trigger Selection */}
            <div className="mt-4">
              <span className="block text-[12px] font-semibold text-ink">
                WHEN input matches:
              </span>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {TRIGGERS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTriggerId(t.id);
                      playClick();
                    }}
                    data-active={triggerId === t.id}
                    className="rounded-lg border border-subtle/80 bg-base px-2.5 py-1.5 text-center text-[12px] font-medium transition-all data-[active=true]:border-accent data-[active=true]:bg-accent/15 data-[active=true]:text-accent text-muted hover:text-ink"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Segmented Action Selection */}
            <div className="mt-4">
              <span className="block text-[12px] font-semibold text-ink">
                THEN execute capability:
              </span>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {ACTIONS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => {
                      setActionId(a.id);
                      playClick();
                    }}
                    data-active={actionId === a.id}
                    className="rounded-lg border border-subtle/80 bg-base px-2.5 py-1.5 text-center text-[12px] font-medium transition-all data-[active=true]:border-active data-[active=true]:bg-active/15 data-[active=true]:text-active text-muted hover:text-ink"
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 1-Click Hardware Test Triggers */}
            <div className="mt-5 border-t border-subtle/60 pt-4">
              <span className="label-mono text-[10px]">
                Instant Trigger Switches
              </span>
              <div className="mt-2.5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    publish("hotkey", "keyboard", {
                      chord: "Space",
                      device: "switch_matrix",
                    });
                  }}
                  className="rounded-lg border border-orange-500/30 bg-gradient-to-b from-[#2a2622] to-[#181613] px-3.5 py-2 font-mono text-[12px] font-bold text-orange-300 shadow-[0_4px_10px_rgba(10,8,6,0.6),inset_0_1px_0_rgba(255,250,240,0.08)] transition-all hover:border-orange-400 hover:shadow-[0_0_16px_rgba(217,107,67,0.3)] active:translate-y-0.5"
                >
                  [SPACE]
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    publish("hotkey", "keyboard", {
                      chord: "Cmd + K",
                      device: "keyboard",
                    });
                  }}
                  className="rounded-lg border border-amber-500/30 bg-gradient-to-b from-[#2a2622] to-[#181613] px-3.5 py-2 font-mono text-[12px] font-bold text-amber-300 shadow-[0_4px_10px_rgba(10,8,6,0.6),inset_0_1px_0_rgba(255,250,240,0.08)] transition-all hover:border-amber-400 hover:shadow-[0_0_16px_rgba(217,119,6,0.3)] active:translate-y-0.5"
                >
                  [CMD + K]
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    publish("pointer.flick", "mouse", {
                      direction: "right",
                      distance: 64,
                    });
                  }}
                  className="rounded-lg border border-lime-600/30 bg-gradient-to-b from-[#2a2622] to-[#181613] px-3.5 py-2 font-mono text-[12px] font-bold text-lime-300 shadow-[0_4px_10px_rgba(10,8,6,0.6),inset_0_1px_0_rgba(255,250,240,0.08)] transition-all hover:border-lime-500 hover:shadow-[0_0_16px_rgba(101,163,13,0.3)] active:translate-y-0.5"
                >
                  [FLICK →]
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    publish("pointer.flick", "mouse", {
                      direction: "left",
                      distance: 64,
                    });
                  }}
                  className="rounded-lg border border-stone-500/30 bg-gradient-to-b from-[#2a2622] to-[#181613] px-3.5 py-2 font-mono text-[12px] font-bold text-stone-200 shadow-[0_4px_10px_rgba(10,8,6,0.6),inset_0_1px_0_rgba(255,250,240,0.08)] transition-all hover:border-stone-400 hover:shadow-[0_0_16px_rgba(168,162,158,0.25)] active:translate-y-0.5"
                >
                  [← FLICK]
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Capture Pad for physical keys & mouse drag */}
          <button
            ref={padRef}
            type="button"
            onKeyDown={onPadKeyDown}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            data-armed={armed}
            className="cyber-grid relative mt-6 flex min-h-[6rem] w-full touch-none flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-orange-600/30 bg-[#141210] p-4 text-center shadow-[inset_0_0_24px_rgba(200,90,50,0.1)] transition-all data-[armed=true]:border-orange-400 data-[armed=true]:shadow-[0_0_20px_rgba(217,107,67,0.3)] focus-visible:border-orange-400"
          >
            {/* Corner reticles */}
            <span
              className="pointer-events-none absolute top-2 left-2 font-mono text-[11px] text-orange-400/50"
              aria-hidden="true"
            >
              ┌
            </span>
            <span
              className="pointer-events-none absolute top-2 right-2 font-mono text-[11px] text-orange-400/50"
              aria-hidden="true"
            >
              ┐
            </span>
            <span
              className="pointer-events-none absolute bottom-2 left-2 font-mono text-[11px] text-orange-400/50"
              aria-hidden="true"
            >
              └
            </span>
            <span
              className="pointer-events-none absolute bottom-2 right-2 font-mono text-[11px] text-orange-400/50"
              aria-hidden="true"
            >
              ┘
            </span>

            <div className="relative z-10 flex items-center gap-2.5">
              <IconBadge
                modality="input"
                size="sm"
                icon={<Zap className="h-4 w-4" />}
                glow={armed}
              />
              <span className="text-[13px] font-semibold text-ink">
                Or focus here & press physical keys / drag pointer
              </span>
            </div>
            <div className="relative z-10 flex flex-wrap items-center justify-center gap-x-2.5 text-[11.5px] text-muted">
              <span className="flex items-center gap-1 text-stone-300">
                <Keyboard className="h-3.5 w-3.5 text-orange-400" /> Keyboard
                chords
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-stone-300">
                <MousePointer className="h-3.5 w-3.5 text-amber-400" /> Mouse
                flick
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-stone-300">
                <Gamepad2 className="h-3.5 w-3.5 text-lime-400" /> Controller
                ready
              </span>
            </div>
          </button>
        </div>

        {/* Right: Live Event Bus Stream */}
        <div className="flex h-full flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#1c1a17]/90 p-6 shadow-2xl backdrop-blur-xl">
          <div>
            <div className="flex items-center justify-between border-b border-subtle/70 pb-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-active animate-pulse" />
                <span className="label-mono">TypedEventBus Stream</span>
              </div>
              <span className="font-mono text-[10.5px] text-muted">
                {feed.length} live records
              </span>
            </div>

            {/* Event list */}
            <ul className="mt-3.5 space-y-2.5">
              {feed.slice(0, 4).map((entry) => (
                <li
                  key={entry.key}
                  className="rounded-lg border border-subtle/80 bg-base p-2.5 transition-all"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-subtle/60 pb-1.5">
                    <div className="flex items-center gap-2 font-mono text-[11px] text-ink">
                      <span className="font-semibold text-accent">
                        {entry.event.type}
                      </span>
                      <span className="text-muted">
                        from {entry.event.source}
                      </span>
                    </div>
                    <span
                      data-matched={entry.matched}
                      className="flex items-center gap-1 rounded-full border border-subtle/80 bg-surface px-2 py-0.5 font-mono text-[10px] font-semibold text-muted data-[matched=true]:border-active/60 data-[matched=true]:text-active"
                    >
                      {entry.matched ? (
                        <CheckCircle2 className="h-3 w-3 stroke-[2.5]" />
                      ) : (
                        <Ban className="h-3 w-3 stroke-[2.5]" />
                      )}
                      {entry.matched ? "rule matched" : "no match"}
                    </span>
                  </div>
                  <pre className="mt-1.5 overflow-x-auto font-mono text-[11px] leading-relaxed text-muted">
                    {JSON.stringify(entry.event.payload)}
                  </pre>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-subtle/60 pt-3 font-mono text-[11px] text-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-active" />
              <span>In-memory kernel</span>
            </span>
            <span className="flex items-center gap-1 text-accent">
              <Sparkles className="h-3.5 w-3.5" />
              Latency: &lt; 2ms
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
