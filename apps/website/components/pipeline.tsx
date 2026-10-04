"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRightIcon,
  PlayIcon,
  ArrowCounterClockwiseIcon,
} from "@phosphor-icons/react";
import { playClick, playSuccess, playTone } from "@/lib/sound";

/**
 * The architecture from architecture/multimodal-pipeline.md.
 *
 * Implements an interactive live trace simulator:
 * Visitors can choose a sample signal (Voice, Gesture, Eye, or Keyboard),
 * watch a simulated packet traverse through all 7 stages, and inspect
 * the real normalized JSON event payload at each boundary.
 */

type TraceScenario = {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly payloads: {
    readonly input: string;
    readonly recognition: string;
    readonly normalised: string;
    readonly context: string;
    readonly rule: string;
    readonly action: string;
    readonly adapter: string;
  };
};

const SCENARIOS: readonly TraceScenario[] = [
  {
    id: "voice-theme",
    label: "Voice: 'Dark mode'",
    icon: "🎙",
    payloads: {
      input:
        '{\n  "stream": "audio/raw_pcm_16000",\n  "sample_rate": 16000,\n  "buffer_ms": 64,\n  "vad_active": true\n}',
      recognition:
        '{\n  "engine": "whisper_local_int8",\n  "candidate": "dark mode",\n  "probability": 0.984,\n  "latency_ms": 11.2\n}',
      normalised:
        '{\n  "id": "evt_voc_78a1",\n  "type": "intent.action",\n  "name": "appearance.toggle",\n  "params": { "target": "dark" },\n  "confidence": 0.98\n}',
      context:
        '{\n  "host": "google_chrome",\n  "domain": "omnivra.dev",\n  "focused_element": "BODY",\n  "active_modal": null\n}',
      rule: '{\n  "rule_id": "rule_theme_toggle",\n  "match": true,\n  "priority": 10,\n  "guard_conditions": ["system.ready"]\n}',
      action:
        '{\n  "capability": "browser.document.setAttribute",\n  "permission": "granted",\n  "params": { "data-theme": "dark" }\n}',
      adapter:
        '{\n  "adapter": "omnivra_chrome_runtime",\n  "status": "dispatched",\n  "dom_mutation_ms": 1.4,\n  "success": true\n}',
    },
  },
  {
    id: "gesture-pinch",
    label: "Gesture: Pinch",
    icon: "🤏",
    payloads: {
      input:
        '{\n  "stream": "video/raw_frames_60fps",\n  "resolution": [1280, 720],\n  "frame_id": 98421,\n  "exposure_time_ms": 16.6\n}',
      recognition:
        '{\n  "engine": "mediapipe_hands_v2",\n  "landmarks_count": 21,\n  "pinch_distance": 0.04,\n  "hand": "right",\n  "confidence": 0.991\n}',
      normalised:
        '{\n  "id": "evt_ges_33b8",\n  "type": "gesture.pinch",\n  "name": "action.select_or_toggle",\n  "coordinates": [0.52, 0.48],\n  "confidence": 0.99\n}',
      context:
        '{\n  "host": "visual_studio_code",\n  "cursor_position": [42, 18],\n  "editor_mode": "normal",\n  "active_file": "gallery.tsx"\n}',
      rule: '{\n  "rule_id": "rule_pinch_zoom",\n  "match": true,\n  "compound_modifier": "NONE",\n  "cooldown_ms": 250\n}',
      action:
        '{\n  "capability": "editor.command.execute",\n  "permission": "granted",\n  "command": "workbench.action.zoomIn"\n}',
      adapter:
        '{\n  "adapter": "vscode_extension_host",\n  "transport": "ipc_pipe",\n  "status": "executed",\n  "latency_ms": 8.1\n}',
    },
  },
  {
    id: "gaze-dwell",
    label: "Eye: Dwell 400ms",
    icon: "👁",
    payloads: {
      input:
        '{\n  "stream": "sensor/ir_eye_tracker",\n  "pupil_diameter_mm": 4.1,\n  "glint_vectors": 2,\n  "frequency_hz": 120\n}',
      recognition:
        '{\n  "engine": "omnivra_gaze_filter",\n  "fixation_point": [1024, 768],\n  "dwell_time_ms": 412,\n  "saccade_state": "fixated"\n}',
      normalised:
        '{\n  "id": "evt_gaz_99f4",\n  "type": "gaze.dwell",\n  "name": "input.trigger_click",\n  "target_bounds": [1000, 750, 1050, 790]\n}',
      context:
        '{\n  "host": "os_desktop_window",\n  "active_app": "Omnivra Dashboard",\n  "hovered_target": "btn_activate"\n}',
      rule: '{\n  "rule_id": "rule_gaze_click_dwell",\n  "threshold_ms": 400,\n  "match": true\n}',
      action:
        '{\n  "capability": "desktop.input.virtual_click",\n  "permission": "elevated_granted",\n  "button": "left"\n}',
      adapter:
        '{\n  "adapter": "windows_uinput_adapter",\n  "hardware_hook": "direct_input",\n  "dispatched": true\n}',
    },
  },
];

const STAGES = [
  {
    key: "input",
    name: "Input",
    detail:
      "A microphone, a webcam frame, or a keypress. Raw sensor signal, zero external egress.",
  },
  {
    key: "recognition",
    name: "Recognition",
    detail:
      "A local engine turns signal into a candidate: a spoken phrase, landmark coordinates, or gaze fixation.",
  },
  {
    key: "normalised",
    name: "Normalised event",
    detail:
      "Every engine emits the exact same canonical JSON schema, decoupling inputs from downstream consumers.",
  },
  {
    key: "context",
    name: "Context",
    detail:
      "What is currently focused, active window, host environment, and user state. Evaluated before dispatch.",
  },
  {
    key: "rule",
    name: "Rule",
    detail:
      "Trigger definitions + boundary constraints. Compound triggers merge separate modalities into one rule.",
  },
  {
    key: "action",
    name: "Action",
    detail:
      "A capability invocation with strict permission checks, not a bare unsanitized command.",
  },
  {
    key: "adapter",
    name: "Host adapter",
    detail:
      "The only platform-specific boundary. Adapts capabilities to Chrome, VS Code, or desktop OS APIs.",
  },
] as const;

export function Pipeline() {
  const [activeScenario, setActiveScenario] = useState(0);
  const [activeStage, setActiveStage] = useState(0);
  const [isTracing, setIsTracing] = useState(false);
  const reduce = useReducedMotion();

  const currentScenario = SCENARIOS[activeScenario] ?? SCENARIOS[0]!;
  const currentPayloadKey = STAGES[activeStage]?.key ?? "input";
  const currentPayloadText =
    currentScenario.payloads[
      currentPayloadKey as keyof typeof currentScenario.payloads
    ] ?? "{}";

  const runFullTrace = () => {
    if (isTracing) return;
    setIsTracing(true);
    playTone(480, 0.08);

    let stage = 0;
    setActiveStage(0);

    const interval = setInterval(() => {
      stage += 1;
      if (stage < STAGES.length) {
        setActiveStage(stage);
        playClick();
      } else {
        clearInterval(interval);
        setIsTracing(false);
        playSuccess();
      }
    }, 450);
  };

  return (
    <section
      id="pipeline"
      aria-labelledby="pipeline-heading"
      className="border-y bg-surface"
    >
      <div className="mx-auto max-w-[1400px] px-6 py-24 lg:py-32">
        <p className="label-mono">Architecture</p>
        <h2
          id="pipeline-heading"
          className="mt-4 max-w-[30ch] font-display text-3xl leading-tight font-semibold tracking-tight sm:text-4xl lg:text-5xl"
        >
          One path from signal to action.
        </h2>
        <p className="mt-5 max-w-[58ch] text-[15px] leading-relaxed text-muted">
          Seven stages, and only the last one knows what a browser or editor is.
          Select a sample scenario or run a live packet trace through the
          pipeline.
        </p>

        {/* Interactive Scenario Presets Bar */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-base p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12px] font-semibold text-muted mr-1">
              Trace signal:
            </span>
            {SCENARIOS.map((scen, idx) => (
              <button
                key={scen.id}
                type="button"
                onClick={() => {
                  setActiveScenario(idx);
                  playClick();
                }}
                data-active={activeScenario === idx}
                className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12.5px] font-medium transition-all data-[active=true]:border-accent data-[active=true]:bg-raised data-[active=true]:text-ink text-muted hover:text-ink"
              >
                <span>{scen.icon}</span>
                <span>{scen.label}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={runFullTrace}
            disabled={isTracing}
            className="flex items-center gap-2 rounded-lg bg-accent px-4 py-1.5 text-[13px] font-semibold text-base transition-transform active:translate-y-px disabled:opacity-50"
          >
            {isTracing ? (
              <ArrowCounterClockwiseIcon size={15} className="animate-spin" />
            ) : (
              <PlayIcon size={15} weight="fill" />
            )}
            {isTracing ? "Tracing packet..." : "Animate pipeline trace"}
          </button>
        </div>

        {/* 7-Stage Rail Stepper */}
        <ol className="mt-10 grid gap-2 sm:grid-cols-2 lg:grid-cols-7 lg:gap-0">
          {STAGES.map((stage, i) => {
            const state =
              i === activeStage
                ? "current"
                : i < activeStage
                  ? "done"
                  : "upcoming";
            return (
              <motion.li
                key={stage.name}
                initial={reduce ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{
                  duration: 0.45,
                  delay: i * 0.05,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="relative"
              >
                <button
                  type="button"
                  onClick={() => {
                    setActiveStage(i);
                    playClick();
                  }}
                  data-state={state}
                  aria-current={i === activeStage ? "step" : undefined}
                  className="group w-full rounded-lg px-2 py-3 text-left transition-colors hover:bg-raised lg:px-3"
                >
                  {/* Rail segment */}
                  <span
                    aria-hidden="true"
                    data-state={state}
                    style={
                      {
                        "--seg": `color-mix(in oklab, var(--hue-voice), var(--hue-gesture) ${(i / (STAGES.length - 1)) * 100}%)`,
                      } as React.CSSProperties
                    }
                    className="mb-3 block h-0.5 w-full rounded-full bg-subtle transition-all duration-500 data-[state=current]:bg-[var(--seg)] data-[state=current]:shadow-[0_0_14px_-1px_var(--seg)] data-[state=done]:bg-[var(--seg)]"
                  />
                  <span className="block font-mono text-[10.5px] tabular-nums text-muted opacity-70">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    data-state={state}
                    className="mt-1 block text-[13px] font-semibold text-muted transition-colors data-[state=current]:text-accent data-[state=done]:text-ink"
                  >
                    {stage.name}
                  </span>
                </button>
              </motion.li>
            );
          })}
        </ol>

        {/* Live Payload Inspector & Architecture Detail Split */}
        <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left: Detail description */}
          <div className="flex flex-col justify-between rounded-2xl border bg-base p-6">
            <div className="flex items-start gap-3">
              <ArrowRightIcon
                size={18}
                className="mt-1 shrink-0 text-accent"
                weight="bold"
              />
              <motion.div
                key={activeStage}
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-2"
              >
                <h3 className="font-display text-[17px] font-semibold">
                  Stage {activeStage + 1}: {STAGES[activeStage]?.name}
                </h3>
                <p className="max-w-[56ch] text-[14.5px] leading-relaxed text-muted">
                  {STAGES[activeStage]?.detail}
                </p>
              </motion.div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t pt-4 font-mono text-[11px] text-muted">
              <span>Security: Local process memory only</span>
              <span>Memory safety: Zero-copy buffers</span>
            </div>
          </div>

          {/* Right: Live Normalized Payload JSON Inspector */}
          <div className="flex flex-col rounded-2xl border bg-base p-6">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-active" />
                <span className="font-mono text-[11px] font-semibold text-muted uppercase">
                  Live Event Frame ({STAGES[activeStage]?.name})
                </span>
              </div>
              <span className="font-mono text-[10.5px] text-muted">
                Format: RFC-compliant JSON
              </span>
            </div>

            <pre className="mt-3 max-h-[160px] overflow-x-auto rounded-lg bg-surface p-3 font-mono text-[12px] leading-relaxed text-accent/90 selection:bg-accent/20">
              <code>{currentPayloadText}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
