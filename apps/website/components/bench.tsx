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
  KeyboardIcon,
  GameControllerIcon,
  CursorIcon,
  LightningIcon,
  CheckCircleIcon,
  ProhibitIcon,
} from "@phosphor-icons/react";
import { playTone } from "@/lib/sound";

/**
 * The bench: the landing page running the actual kernel.
 *
 * Every other section describes the architecture. This one imports
 * `@omnivra/core` from the workspace and lets the visitor drive it with their
 * own hardware. The rule below is a real `OmnivraRule` handed to the real
 * `RuleEvaluator`; the events are real `OmnivraEvent` objects published on the
 * real `TypedEventBus`; the action runs through the real `ActionDispatcher`
 * into a `HostAdapter` whose host happens to be this page. Nothing here is a
 * reimplementation, which is the point: if the claim "one rule format" were
 * false, this section would visibly fail.
 *
 * A keyboard chord and a gamepad button both publish `hotkey` because the
 * kernel genuinely does not distinguish them. That is the thesis, demonstrated
 * rather than asserted: one rule, written once, fires from either.
 *
 * Honesty note, consistent with the status labels elsewhere on the page: the
 * pointer flick is a mouse gesture read from pointer events. It is not webcam
 * hand tracking, which is still Planned, and it is labelled as pointer input
 * everywhere it appears.
 */

type TriggerChoice = {
  id: string;
  label: string;
  /** Matches `OmnivraEvent.type`; "*" matches everything. */
  eventType: string;
  hint: string;
};

const TRIGGERS: readonly TriggerChoice[] = [
  {
    id: "any",
    label: "Any input",
    eventType: "*",
    hint: "One rule, every source. Key, controller or flick all fire it.",
  },
  {
    id: "hotkey",
    label: "Key or controller button",
    eventType: "hotkey",
    hint: "The kernel does not distinguish the two.",
  },
  {
    id: "flick",
    label: "Pointer flick",
    eventType: "pointer.flick",
    hint: "A direction read from pointer events.",
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
    label: "Switch the theme",
    type: "theme.toggle",
    capability: "ui.theme",
  },
  {
    id: "notify",
    label: "Emit runtime notification",
    type: "runtime.notify",
    capability: "runtime.event",
    payload: { status: "success", origin: "omnivra.bench" },
  },
  {
    id: "tone",
    label: "Play a tone",
    type: "audio.tone",
    capability: "audio.play",
    payload: { frequency: 523.25 },
  },
];

/** Context values the demo stamps onto every event it publishes. */
const ACTIVE_APP = "browser";

type FeedEntry = {
  key: string;
  event: OmnivraEvent;
  matched: boolean;
};

export function Bench() {
  const kernelRef = useRef<OmnivraKernel | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const padRef = useRef<HTMLButtonElement>(null);

  const [triggerId, setTriggerId] = useState<string>("any");
  const [actionId, setActionId] = useState<string>("theme");
  const [requiredApp, setRequiredApp] = useState<string>("");
  const [feed, setFeed] = useState<FeedEntry[]>([]);
  const [gamepad, setGamepad] = useState<string | null>(null);
  const [armed, setArmed] = useState(false);

  const trigger = TRIGGERS.find((t) => t.id === triggerId) ?? TRIGGERS[0]!;
  const action = ACTIONS.find((a) => a.id === actionId) ?? ACTIONS[0]!;

  /** The rule exactly as the evaluator receives it. */
  const rule: OmnivraRule = {
    id: "bench-rule",
    name: "Bench rule",
    enabled: true,
    priority: 1,
    trigger: { type: "hotkey", name: trigger.eventType },
    ...(requiredApp
      ? {
          conditions: [
            {
              field: "activeApp",
              operator: "equals" as const,
              value: requiredApp,
            },
          ],
        }
      : {}),
    actions: [
      {
        id: `${action.id}-action`,
        type: action.type,
        capabilityRequired: action.capability,
        ...(action.payload ? { payload: action.payload } : {}),
      },
    ],
  };

  // One kernel for the lifetime of the section, with this page as its host.
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
              "0 0 0 0 color-mix(in srgb, var(--accent-primary) 55%, transparent)",
          },
          { boxShadow: "0 0 0 14px transparent" },
        ],
        { duration: 650, easing: "cubic-bezier(0.16,1,0.3,1)" },
      );
    };

    const adapter: HostAdapter = {
      id: "web-page",
      name: "This page",
      capabilities: ["ui.theme", "ui.navigate", "audio.play"],
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
            return {
              success: true,
              actionId: descriptor.id,
              output: "Notification dispatched locally",
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

  // Re-register whenever the composed rule changes.
  useEffect(() => {
    const kernel = kernelRef.current;
    if (!kernel) return;
    kernel.ruleEvaluator.registerRule(rule);
    // The rule object is rebuilt each render; its serialised form is the
    // dependency that actually matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(rule)]);

  const publish = useCallback(
    (type: string, source: OmnivraEvent["source"], payload: unknown) => {
      const kernel = kernelRef.current;
      if (!kernel) return;

      const event: OmnivraEvent = {
        id: crypto.randomUUID(),
        type,
        source,
        timestamp: Date.now(),
        // Deterministic inputs are certain; a recogniser would report less.
        confidence: 1,
        context: { activeApp: ACTIVE_APP, timestamp: Date.now() },
        payload,
      };

      // Ask the evaluator what this event matches before publishing, so the
      // feed can show the non-matching case rather than silently dropping it.
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
        ].slice(0, 6),
      );
    },
    [],
  );

  // Keyboard chords, captured only while the pad holds focus.
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
    publish("hotkey", "keyboard", { chord, device: "keyboard" });
  };

  // Gamepad. Polled only while one is connected, never as a standing loop.
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

    // A controller paired before this mounted never fires connect.
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

  // Pointer flick: direction and distance from one press to its release.
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
    if (Math.hypot(dx, dy) < 24) return;
    const direction =
      Math.abs(dx) > Math.abs(dy)
        ? dx > 0
          ? "right"
          : "left"
        : dy > 0
          ? "down"
          : "up";
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
      <h2
        id="bench-heading"
        className="max-w-[28ch] font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl"
      >
        Run the engine with your own hardware.
      </h2>
      <p className="mt-2 max-w-[62ch] text-[14px] leading-relaxed text-muted">
        This panel imports the same kernel the extension ships. Compose a rule,
        then fire it with a key, a game controller or a flick of the pointer.
        The events below are the real ones.
      </p>

      <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* Composer */}
        <div
          ref={panelRef}
          className="rounded-[var(--radius-card)] border border-subtle/80 bg-surface/90 p-5"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="label-mono">When</span>
              <select
                value={triggerId}
                onChange={(e) => setTriggerId(e.target.value)}
                className="mt-2 w-full cursor-pointer rounded-[var(--radius-control)] border bg-base px-3.5 py-2.5 text-[14px] text-ink outline-none transition-colors hover:border-accent/60 focus:border-accent"
              >
                {TRIGGERS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="label-mono">Then</span>
              <select
                value={actionId}
                onChange={(e) => setActionId(e.target.value)}
                className="mt-2 w-full cursor-pointer rounded-[var(--radius-control)] border bg-base px-3.5 py-2.5 text-[14px] text-ink outline-none transition-colors hover:border-accent/60 focus:border-accent"
              >
                {ACTIONS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="mt-5 block">
            <span className="label-mono">Only when the active app is</span>
            <select
              value={requiredApp}
              onChange={(e) => setRequiredApp(e.target.value)}
              className="mt-2 w-full cursor-pointer rounded-[var(--radius-control)] border bg-base px-3.5 py-2.5 text-[14px] text-ink outline-none transition-colors hover:border-accent/60 focus:border-accent"
            >
              <option value="">Anything</option>
              <option value="browser">browser</option>
              <option value="editor">editor</option>
            </select>
            <span className="mt-2 block text-[12.5px] leading-relaxed text-muted">
              {requiredApp === "editor"
                ? "Events here carry activeApp: browser, so this condition will not pass. The feed will show the event arriving and matching nothing."
                : trigger.hint}
            </span>
          </label>

          {/* Capture pad */}
          <button
            ref={padRef}
            type="button"
            onKeyDown={onPadKeyDown}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            data-armed={armed}
            className="mt-6 flex min-h-[8.5rem] w-full touch-none flex-col items-center justify-center gap-2 rounded-[var(--radius-control)] border border-dashed bg-base px-4 py-6 text-center transition-colors data-[armed=true]:border-accent focus-visible:border-accent"
          >
            <LightningIcon size={22} className="text-accent" />
            <span className="text-[14px] font-semibold">
              Focus here, then press a key or flick
            </span>
            <span className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[12px] text-muted">
              <span className="flex items-center gap-1.5">
                <KeyboardIcon size={14} /> Any chord
              </span>
              <span className="flex items-center gap-1.5">
                <CursorIcon size={14} /> Drag and release
              </span>
              <span className="flex items-center gap-1.5">
                <GameControllerIcon size={14} />
                {gamepad ? "Controller ready" : "No controller"}
              </span>
            </span>
          </button>

          <details className="mt-5">
            <summary className="cursor-pointer text-[13px] text-muted">
              The rule, as the evaluator receives it
            </summary>
            <pre className="mt-3 overflow-x-auto rounded-[var(--radius-control)] border bg-base p-4 font-mono text-[11.5px] leading-relaxed text-muted">
              {JSON.stringify(rule, null, 2)}
            </pre>
          </details>
        </div>

        {/* Live feed */}
        <div className="rounded-[var(--radius-card)] border bg-surface p-6">
          <div className="flex items-center justify-between">
            <span className="label-mono">Event bus</span>
            <span className="font-mono text-[11px] text-muted">
              {feed.length ? `${feed.length} most recent` : "waiting"}
            </span>
          </div>

          {feed.length === 0 ? (
            <p className="mt-10 mb-10 text-center text-[13.5px] text-muted">
              Nothing published yet. Focus the pad and press any key.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {feed.map((entry) => (
                <li
                  key={entry.key}
                  className="overflow-hidden rounded-[var(--radius-control)] border bg-base"
                >
                  <div className="flex items-center justify-between gap-3 border-b px-3.5 py-2">
                    <span className="flex items-center gap-2 font-mono text-[11.5px] text-ink">
                      <span className="text-accent">{entry.event.type}</span>
                      <span className="text-muted">
                        source: {entry.event.source}
                      </span>
                    </span>
                    <span
                      data-matched={entry.matched}
                      className="flex shrink-0 items-center gap-1.5 rounded-[var(--radius-pill)] border px-2 py-0.5 font-mono text-[10.5px] text-muted data-[matched=true]:border-active data-[matched=true]:text-active"
                    >
                      {entry.matched ? (
                        <CheckCircleIcon size={12} weight="bold" />
                      ) : (
                        <ProhibitIcon size={12} weight="bold" />
                      )}
                      {entry.matched ? "matched" : "no match"}
                    </span>
                  </div>
                  <pre className="overflow-x-auto px-3.5 py-2.5 font-mono text-[11px] leading-relaxed text-muted">
                    {JSON.stringify(entry.event.payload)}
                  </pre>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
