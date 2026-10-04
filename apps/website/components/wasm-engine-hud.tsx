"use client";

import { useState } from "react";
import {
  CpuIcon,
  ShieldCheckIcon,
  HardDrivesIcon,
  CaretDownIcon,
  CheckCircleIcon,
  LightningIcon,
} from "@phosphor-icons/react";
import { playClick } from "@/lib/sound";

export function WasmEngineHud() {
  const [expanded, setExpanded] = useState(false);

  const engines = [
    {
      name: "whisper.wasm",
      type: "Speech Engine",
      simd: true,
      latency: "11.2ms",
      memory: "38.4 MB",
      status: "Initialized",
      color: "var(--hue-voice)",
    },
    {
      name: "mediapipe_hands.wasm",
      type: "Vision / Pose (21 3D Joints)",
      simd: true,
      latency: "8.1ms",
      memory: "24.6 MB",
      status: "Ready",
      color: "var(--hue-gesture)",
    },
    {
      name: "gaze_kalman.wasm",
      type: "Eye Tracking & Dwell Filter",
      simd: false,
      latency: "1.2ms",
      memory: "4.2 MB",
      status: "Ready",
      color: "var(--hue-gaze)",
    },
  ];

  return (
    <section className="mx-auto max-w-[1400px] px-6 py-6">
      <div className="overflow-hidden rounded-2xl border bg-surface/90 backdrop-blur-md shadow-lg">
        {/* Header Bar */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            setExpanded(!expanded);
            playClick();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setExpanded(!expanded);
              playClick();
            }
          }}
          className="flex cursor-pointer items-center justify-between gap-4 p-5 transition-colors hover:bg-raised/50"
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <CpuIcon size={18} weight="duotone" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-[15px] font-semibold tracking-tight">
                  Local WebAssembly (Wasm) Runtime
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full border border-active/40 bg-active/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-active">
                  <CheckCircleIcon size={12} weight="fill" />
                  SIMD ENABLED
                </span>
              </div>
              <p className="text-[12.5px] text-muted">
                All models run in-process on your machine. Zero cloud
                dependency.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-4 font-mono text-[11.5px] text-muted">
              <span className="flex items-center gap-1.5">
                <HardDrivesIcon size={14} />
                Heap: 67.2 MB
              </span>
              <span className="flex items-center gap-1.5 text-active">
                <ShieldCheckIcon size={14} />
                Egress: 0 Bytes
              </span>
            </div>

            <CaretDownIcon
              size={16}
              className={`text-muted transition-transform duration-300 ${
                expanded ? "rotate-180 text-ink" : ""
              }`}
            />
          </div>
        </div>

        {/* Collapsible Diagnostics Table */}
        {expanded && (
          <div className="border-t p-5 pt-4 space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {engines.map((eng) => (
                <div
                  key={eng.name}
                  className="rounded-xl border bg-base p-4 space-y-2.5 transition-all hover:border-accent/40"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="font-mono text-[12px] font-bold"
                      style={{ color: eng.color }}
                    >
                      {eng.name}
                    </span>
                    <span className="rounded bg-raised px-1.5 py-0.5 font-mono text-[10px] text-active">
                      {eng.status}
                    </span>
                  </div>

                  <p className="text-[12px] text-muted">{eng.type}</p>

                  <div className="flex items-center justify-between border-t pt-2 font-mono text-[11px] text-muted">
                    <span className="flex items-center gap-1">
                      <LightningIcon size={12} className="text-accent" />
                      {eng.latency}
                    </span>
                    <span>{eng.memory}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-subtle bg-base/50 px-4 py-2.5 font-mono text-[11px] text-muted">
              <span>Host Isolation: Chromium V8 Isolated-World sandbox</span>
              <span className="text-accent">W3C WebAssembly Threads: ON</span>
              <span>Hardware Acceleration: WebGPU / Vulkan backend ready</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
