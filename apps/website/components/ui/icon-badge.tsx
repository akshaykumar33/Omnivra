"use client";

import React from "react";

type ModalityType = "voice" | "gesture" | "gaze" | "face" | "input" | "system";

type IconBadgeProps = {
  modality: ModalityType;
  icon: React.ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
  pulse?: boolean;
  glow?: boolean;
};

const THEME_STYLES: Record<
  ModalityType,
  {
    border: string;
    bg: string;
    glow: string;
    text: string;
    accentHex: string;
  }
> = {
  voice: {
    border: "border-orange-500/30 group-hover:border-orange-400/60",
    bg: "bg-gradient-to-br from-orange-500/15 via-stone-900/40 to-stone-950/60",
    glow: "shadow-[0_0_18px_rgba(217,107,67,0.25)]",
    text: "text-orange-400 group-hover:text-orange-300",
    accentHex: "#d96b43",
  },
  gesture: {
    border: "border-amber-500/30 group-hover:border-amber-400/60",
    bg: "bg-gradient-to-br from-amber-500/15 via-stone-900/40 to-stone-950/60",
    glow: "shadow-[0_0_18px_rgba(217,119,6,0.25)]",
    text: "text-amber-400 group-hover:text-amber-300",
    accentHex: "#d97706",
  },
  gaze: {
    border: "border-lime-600/30 group-hover:border-lime-500/60",
    bg: "bg-gradient-to-br from-lime-600/15 via-stone-900/40 to-stone-950/60",
    glow: "shadow-[0_0_18px_rgba(101,163,13,0.22)]",
    text: "text-lime-400 group-hover:text-lime-300",
    accentHex: "#65a30d",
  },
  face: {
    border: "border-amber-600/30 group-hover:border-amber-500/60",
    bg: "bg-gradient-to-br from-amber-600/15 via-stone-900/40 to-stone-950/60",
    glow: "shadow-[0_0_18px_rgba(224,159,82,0.25)]",
    text: "text-amber-300 group-hover:text-amber-200",
    accentHex: "#e09f52",
  },
  input: {
    border: "border-orange-600/35 group-hover:border-orange-500/70",
    bg: "bg-gradient-to-br from-orange-600/20 via-stone-900/40 to-stone-950/60",
    glow: "shadow-[0_0_18px_rgba(200,90,50,0.28)]",
    text: "text-orange-400 group-hover:text-orange-300",
    accentHex: "#c85a32",
  },
  system: {
    border: "border-stone-400/25 group-hover:border-stone-300/50",
    bg: "bg-gradient-to-br from-stone-400/10 via-stone-800/30 to-stone-950/40",
    glow: "shadow-[0_0_16px_rgba(245,242,235,0.12)]",
    text: "text-stone-200 group-hover:text-white",
    accentHex: "#f5f2eb",
  },
};

const SIZE_STYLES = {
  sm: "h-7 w-7 rounded-lg text-xs",
  md: "h-10 w-10 rounded-xl text-sm",
  lg: "h-14 w-14 rounded-2xl text-base",
};

export function IconBadge({
  modality,
  icon,
  size = "md",
  className = "",
  pulse = false,
  glow = true,
}: IconBadgeProps) {
  const t = THEME_STYLES[modality];
  const s = SIZE_STYLES[size];

  return (
    <div
      className={`group relative inline-flex shrink-0 items-center justify-center border backdrop-blur-md transition-all duration-300 ${t.border} ${t.bg} ${glow ? t.glow : ""} ${t.text} ${s} ${className}`}
    >
      {/* Specular top sheen line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      {/* Optional ambient pulsing radar ring */}
      {pulse && (
        <span
          className="pointer-events-none absolute inset-0 -m-1 rounded-inherit animate-ping opacity-35"
          style={{ borderColor: t.accentHex, borderWidth: "1px" }}
        />
      )}

      {/* Icon payload */}
      <span className="relative z-10 transition-transform duration-200 group-hover:scale-110">
        {icon}
      </span>
    </div>
  );
}

/**
 * Animated Frequency Audio Pill: Shows miniature equalizing audio bars
 * alongside voice interactions.
 */
export function AudioVisualizerPill({ active }: { active?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-0.5 px-1 py-0.5"
      aria-hidden="true"
    >
      {[40, 85, 60, 100, 50].map((height, i) => (
        <span
          key={i}
          style={{
            height: active ? `${height}%` : "30%",
            transition: "height 0.15s ease-in-out",
          }}
          className={`w-0.5 rounded-full bg-orange-400 ${active ? "animate-pulse" : "opacity-40"}`}
        />
      ))}
    </span>
  );
}
