"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Play, RotateCcw, Mic, Hand, Eye } from "lucide-react";
import { playClick, playSuccess, playTone } from "@/lib/sound";
import { IconBadge } from "./ui/icon-badge";

/**
 * Architecture Pipeline: Seven-stage monotonic trace simulator.
 *
 * Implements an interactive live trace simulator:
 * Visitors can choose a sample signal (Voice, Gesture, or Eye tracking),
 * step through all 7 stages, and inspect the real normalized JSON event
 * payload at each boundary with tokenized syntax highlighting.
 */

type TraceScenario = {
  readonly id: string;
  readonly label: string;
  readonly icon: React.ReactNode;
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
    icon: (
      <IconBadge
        modality="voice"
        size="sm"
        icon={<Mic className="h-3 w-3" />}
        glow={false}
      />
    ),
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
    icon: (
      <IconBadge
        modality="gesture"
        size="sm"
        icon={<Hand className="h-3 w-3" />}
        glow={false}
      />
    ),
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
    icon: (
      <IconBadge
        modality="gaze"
        size="sm"
        icon={<Eye className="h-3 w-3" />}
        glow={false}
      />
    ),
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
    name: "Normalized event",
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

/**
 * High-performance client JSON syntax highlighter.
 */
function HighlightedJson({ code }: { code: string }) {
  const regex =
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?|[{}[\],:])/g;
  const tokens: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyIndex = 0;

  while ((match = regex.exec(code)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(
        <span key={`text-${keyIndex++}`}>
          {code.slice(lastIndex, match.index)}
        </span>,
      );
    }
    const token = match[0];
    if (token.endsWith(":")) {
      // JSON Key
      tokens.push(
        <span key={`k-${keyIndex++}`} className="font-semibold text-accent">
          {token.slice(0, -1)}
        </span>,
        <span key={`c-${keyIndex++}`} className="text-muted">
          :
        </span>,
      );
    } else if (token.startsWith('"')) {
      // String value
      tokens.push(
        <span key={`s-${keyIndex++}`} className="text-active">
          {token}
        </span>,
      );
    } else if (token === "true" || token === "false") {
      // Boolean
      tokens.push(
        <span key={`b-${keyIndex++}`} className="font-medium text-gesture">
          {token}
        </span>,
      );
    } else if (token === "null") {
      tokens.push(
        <span key={`n-${keyIndex++}`} className="italic text-muted">
          {token}
        </span>,
      );
    } else if (/^-?\d/.test(token)) {
      // Number
      tokens.push(
        <span key={`num-${keyIndex++}`} className="text-warning">
          {token}
        </span>,
      );
    } else {
      // Structural punctuation
      tokens.push(
        <span key={`p-${keyIndex++}`} className="text-muted/70">
          {token}
        </span>,
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < code.length) {
    tokens.push(
      <span key={`tail-${keyIndex++}`}>{code.slice(lastIndex)}</span>,
    );
  }

  return <code>{tokens}</code>;
}

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
      className="border-y border-subtle/80 bg-surface/50"
    >
      <div className="mx-auto max-w-[1400px] px-6 py-12 lg:py-16">
        <p className="label-mono">Architecture</p>
        <h2
          id="pipeline-heading"
          className="mt-2 max-w-[30ch] font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl"
        >
          One path from signal to action.
        </h2>
        <p className="mt-2 max-w-[58ch] text-[14px] leading-relaxed text-muted">
          Seven stages, and only the last one touches browser or editor APIs.
          Select a sample scenario or step through the live pipeline.
        </p>

        {/* Interactive Scenario Presets Bar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-subtle/80 bg-base p-3">
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
                className="flex items-center gap-1.5 rounded-lg border border-subtle/70 bg-surface px-2.5 py-1.5 text-[12px] font-medium transition-all data-[active=true]:border-accent data-[active=true]:bg-raised data-[active=true]:text-ink text-muted hover:text-ink"
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
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 px-4 py-2 text-[13px] font-semibold text-white shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] active:scale-[0.98] disabled:opacity-50"
          >
            {isTracing ? (
              <RotateCcw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4 fill-current" />
            )}
            {isTracing ? "Tracing pipeline..." : "Step through pipeline"}
          </button>
        </div>

        {/* 7-Stage Rail Stepper */}
        <ol className="mt-6 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-7 lg:gap-0">
          {STAGES.map((stage, i) => {
            const state =
              i === activeStage
                ? "current"
                : i < activeStage
                  ? "done"
                  : "upcoming";
            return (
              <li key={stage.name} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setActiveStage(i);
                    playClick();
                  }}
                  data-state={state}
                  aria-current={i === activeStage ? "step" : undefined}
                  className="group w-full rounded-lg px-2 py-2 text-left transition-colors hover:bg-raised lg:px-2.5"
                >
                  {/* Rail segment */}
                  <div className="relative mb-2">
                    <span
                      aria-hidden="true"
                      data-state={state}
                      style={
                        {
                          "--seg": `color-mix(in oklab, var(--hue-voice), var(--hue-gesture) ${(i / (STAGES.length - 1)) * 100}%)`,
                        } as React.CSSProperties
                      }
                      className="block h-1 w-full rounded-full bg-subtle/80 transition-all duration-300 data-[state=current]:bg-[var(--seg)] data-[state=current]:shadow-[0_0_12px_var(--seg)] data-[state=done]:bg-[var(--seg)]"
                    />
                    {i === activeStage && !reduce && (
                      <span className="absolute -top-1 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-surface bg-accent shadow-sm" />
                    )}
                  </div>

                  <span className="block font-mono text-[10px] tabular-nums text-muted">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    data-state={state}
                    className="mt-0.5 block text-[12.5px] font-semibold text-muted transition-colors data-[state=current]:text-accent data-[state=done]:text-ink"
                  >
                    {stage.name}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        {/* Live Payload Inspector & Architecture Detail Split */}
        <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_1.15fr] items-stretch">
          {/* Left: Detail description */}
          <div className="flex h-full flex-col justify-between rounded-2xl border border-white/[0.1] bg-[#0c0e17]/80 p-6 shadow-xl backdrop-blur-xl transition-all hover:border-cyan-400/40 hover:shadow-[0_0_24px_rgba(6,182,212,0.15)]">
            <div className="flex items-start gap-3.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cyan-400/30 bg-cyan-950/30 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </div>
              <motion.div
                key={activeStage}
                initial={reduce ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-2"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-cyan-300">
                  Stage {activeStage + 1} of 7: {STAGES[activeStage]?.name}
                </div>
                <h3 className="font-display text-[17px] font-semibold text-ink">
                  {STAGES[activeStage]?.name}
                </h3>
                <p className="max-w-[52ch] text-[13.5px] leading-relaxed text-muted">
                  {STAGES[activeStage]?.detail}
                </p>
              </motion.div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-white/[0.08] pt-3 font-mono text-[11px] text-muted">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
                <span>In-memory process boundary</span>
              </span>
              <span className="text-cyan-400/80">Data flow: Monotonic</span>
            </div>
          </div>

          {/* Right: Live Normalized Payload JSON Inspector */}
          <div className="flex h-full flex-col justify-between rounded-2xl border border-white/[0.1] bg-[#070810]/95 p-6 shadow-2xl backdrop-blur-xl transition-all hover:border-purple-400/40 hover:shadow-[0_0_24px_rgba(168,85,247,0.15)]">
            <div>
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981] animate-pulse" />
                  <span className="font-mono text-[11px] font-semibold text-ink uppercase tracking-wider">
                    Live Event Frame ({STAGES[activeStage]?.name})
                  </span>
                </div>
                <span className="font-mono text-[10.5px] text-muted">
                  Format: RFC-compliant JSON
                </span>
              </div>

              <pre className="mt-3 max-h-[170px] overflow-x-auto rounded-xl border border-white/[0.06] bg-[#040508] p-3.5 font-mono text-[12px] leading-relaxed selection:bg-cyan-500/30">
                <HighlightedJson code={currentPayloadText} />
              </pre>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-white/[0.08] pt-3 font-mono text-[11px] text-muted">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_#8b5cf6]" />
                <span>Zero host leakage</span>
              </span>
              <span className="text-emerald-400 font-semibold">
                Boundary latency: &lt;1.8ms
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
