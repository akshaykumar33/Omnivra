"use client";

import { useState } from "react";
import { Mic, Hand, Eye, Smile, Keyboard } from "lucide-react";
import {
  VoiceVisual,
  GestureVisual,
  GazeVisual,
  FaceVisual,
  ClassicVisual,
} from "./modality-visuals";

/**
 * The input gallery: Five modality families normalized into one rule format.
 *
 * Designed with a responsive, high-craft card grid and interactive cursor
 * spotlighting. Eliminates disruptive scroll-pin hijacking so navigation
 * remains natural, fluid, and predictable across all devices.
 */
type Panel = {
  readonly id: string;
  readonly index: string;
  readonly name: string;
  readonly line: string;
  readonly body: string;
  readonly status: "Alpha" | "Planned";
  readonly hue: string;
  readonly icon: React.ReactNode;
  readonly visual: React.ReactNode;
};

const PANELS: readonly Panel[] = [
  {
    id: "voice",
    index: "01",
    name: "Voice",
    line: "Say it.",
    body: "Wake words, dictation and intent phrases. Runs locally on your machine with zero server streaming.",
    status: "Alpha",
    hue: "var(--hue-voice)",
    icon: <Mic size={24} />,
    visual: <VoiceVisual />,
  },
  {
    id: "gesture",
    index: "02",
    name: "Hand gestures",
    line: "Point at it.",
    body: "Pinch, palm, swipe and finger tracking from your webcam, normalized into standard pipeline events.",
    status: "Planned",
    hue: "var(--hue-gesture)",
    icon: <Hand size={24} />,
    visual: <GestureVisual />,
  },
  {
    id: "gaze",
    index: "03",
    name: "Eye tracking",
    line: "Look at it.",
    body: "Dwell targets, blink patterns and gaze regions for hands-free cursor navigation.",
    status: "Planned",
    hue: "var(--hue-gaze)",
    icon: <Eye size={24} />,
    visual: <GazeVisual />,
  },
  {
    id: "face",
    index: "04",
    name: "Facial expression",
    line: "Mean it.",
    body: "Brow raises, head tilt and mouth shapes acting as compound modifiers on primary gestures.",
    status: "Planned",
    hue: "var(--hue-face)",
    icon: <Smile size={24} />,
    visual: <FaceVisual />,
  },
  {
    id: "classic",
    index: "05",
    name: "Keyboard & hardware",
    line: "Or just type.",
    body: "Mechanical switches, hotkeys and gamepads combinable with every modality into compound rules.",
    status: "Planned",
    hue: "var(--hue-input)",
    icon: <Keyboard size={24} />,
    visual: <ClassicVisual />,
  },
];

function GalleryCard({
  panel,
  className = "",
}: {
  panel: Panel;
  className?: string;
}) {
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({
      x: Math.round(e.clientX - rect.left),
      y: Math.round(e.clientY - rect.top),
    });
  };

  const handlePointerLeave = () => setCoords(null);

  return (
    <article
      style={{ "--glow": panel.hue } as React.CSSProperties}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`group relative flex h-[370px] flex-col justify-between overflow-hidden rounded-2xl border border-subtle/80 bg-surface/90 p-6 transition-all duration-300 hover:border-accent/60 hover:shadow-xl backdrop-blur-sm ${className}`}
    >
      {/* Background Modality Technical Art: Unveiled and Vibrant */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-90 transition-opacity duration-300 group-hover:opacity-100">
        {panel.visual}
        {/* Soft bottom veil to ensure text readability */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-surface via-surface/90 to-transparent"
        />
      </div>

      {/* Dynamic Cursor Spotlight Overlay */}
      {coords && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-200"
          style={{
            background: `radial-gradient(350px circle at ${coords.x}px ${coords.y}px, color-mix(in srgb, var(--glow) 25%, transparent), transparent 70%)`,
          }}
        />
      )}

      {/* Card Header: Modality Index & Status Badge */}
      <div className="relative z-10 flex items-center justify-between">
        <span
          className="font-mono text-[12px] font-bold tracking-[0.16em]"
          style={{ color: panel.hue }}
        >
          {panel.index}
        </span>
        <span
          data-alpha={panel.status === "Alpha"}
          className="rounded-full border border-subtle/80 bg-base/80 px-2.5 py-0.5 font-mono text-[10px] font-semibold tracking-wide text-muted uppercase backdrop-blur-sm data-[alpha=true]:border-active/60 data-[alpha=true]:text-active"
        >
          {panel.status}
        </span>
      </div>

      {/* Card Footer: Icon, Headlines, Copy */}
      <div className="relative z-10 mt-auto">
        <span
          className="mb-2.5 block transition-transform duration-300 group-hover:scale-105"
          style={{ color: panel.hue }}
        >
          {panel.icon}
        </span>
        <h3 className="font-display text-xl font-semibold tracking-tight text-ink">
          {panel.line}
        </h3>
        <p className="mt-1 text-[13px] font-medium text-ink/90">{panel.name}</p>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted line-clamp-3">
          {panel.body}
        </p>
      </div>
    </article>
  );
}

export function Gallery() {
  return (
    <section
      id="inputs"
      aria-labelledby="gallery-heading"
      className="border-y border-subtle/80 bg-base"
    >
      <div className="mx-auto max-w-[1400px] px-6 py-12 lg:py-16">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="label-mono">The inputs</p>
            <h2
              id="gallery-heading"
              className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl"
            >
              Five families.{" "}
              <span className="text-muted">One rule format.</span>
            </h2>
          </div>
          <p className="max-w-[44ch] text-[13.5px] leading-relaxed text-muted">
            Every modality normalizes to the same canonical event shape, so a
            rule written for a key combination works for a gesture without
            rewrite.
          </p>
        </div>

        {/* 5-Card Ergonomic Bento Grid (3 on top row, 2 widescreen on bottom row) */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {PANELS.map((panel, idx) => (
            <GalleryCard
              key={panel.id}
              panel={panel}
              className={idx < 3 ? "lg:col-span-2" : "lg:col-span-3"}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
