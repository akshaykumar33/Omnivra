"use client";

import { useState } from "react";
import {
  MicrophoneIcon,
  HandIcon,
  EyeIcon,
  SmileyIcon,
  KeyboardIcon,
} from "@phosphor-icons/react";
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
    icon: <MicrophoneIcon size={24} weight="duotone" />,
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
    icon: <HandIcon size={24} weight="duotone" />,
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
    icon: <EyeIcon size={24} weight="duotone" />,
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
    icon: <SmileyIcon size={24} weight="duotone" />,
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
    icon: <KeyboardIcon size={24} weight="duotone" />,
    visual: <ClassicVisual />,
  },
];

function GalleryCard({ panel }: { panel: Panel }) {
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
      className="group relative flex h-[360px] flex-col justify-between overflow-hidden rounded-2xl border border-subtle/80 bg-surface/90 p-6 transition-all duration-300 hover:border-accent/50 hover:shadow-xl backdrop-blur-sm"
    >
      {/* Background Modality Technical Art */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-70 transition-opacity duration-300 group-hover:opacity-100">
        {panel.visual}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-surface via-surface/75 to-transparent"
        />
      </div>

      {/* Dynamic Cursor Spotlight Overlay */}
      {coords && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-200"
          style={{
            background: `radial-gradient(350px circle at ${coords.x}px ${coords.y}px, color-mix(in srgb, var(--glow) 22%, transparent), transparent 70%)`,
          }}
        />
      )}

      {/* Card Header: Modality Index & Status Badge */}
      <div className="relative z-10 flex items-center justify-between">
        <span
          className="font-mono text-[11px] font-bold tracking-[0.16em]"
          style={{ color: panel.hue }}
        >
          {panel.index}
        </span>
        <span
          data-alpha={panel.status === "Alpha"}
          className="rounded-full border border-subtle/80 bg-base/60 px-2.5 py-0.5 font-mono text-[10px] font-semibold tracking-wide text-muted uppercase backdrop-blur-sm data-[alpha=true]:border-active/60 data-[alpha=true]:text-active"
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

        {/* 5-Card Responsive Grid */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
          {PANELS.map((panel) => (
            <GalleryCard key={panel.id} panel={panel} />
          ))}
        </div>
      </div>
    </section>
  );
}
