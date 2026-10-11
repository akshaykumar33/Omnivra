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
    border: "border-cyan-400/30 group-hover:border-cyan-300/70",
    bg: "bg-gradient-to-br from-cyan-500/15 via-cyan-900/10 to-indigo-950/20",
    glow: "shadow-[0_0_18px_rgba(6,182,212,0.35)]",
    text: "text-cyan-400 group-hover:text-cyan-300",
    accentHex: "#06b6d4",
  },
  gesture: {
    border: "border-purple-400/30 group-hover:border-purple-300/70",
    bg: "bg-gradient-to-br from-purple-500/15 via-fuchsia-900/10 to-indigo-950/20",
    glow: "shadow-[0_0_18px_rgba(168,85,247,0.35)]",
    text: "text-purple-400 group-hover:text-purple-300",
    accentHex: "#8b5cf6",
  },
  gaze: {
    border: "border-emerald-400/30 group-hover:border-emerald-300/70",
    bg: "bg-gradient-to-br from-emerald-500/15 via-teal-900/10 to-slate-950/20",
    glow: "shadow-[0_0_18px_rgba(16,185,129,0.35)]",
    text: "text-emerald-400 group-hover:text-emerald-300",
    accentHex: "#10b981",
  },
  face: {
    border: "border-amber-400/30 group-hover:border-amber-300/70",
    bg: "bg-gradient-to-br from-amber-500/15 via-orange-900/10 to-slate-950/20",
    glow: "shadow-[0_0_18px_rgba(245,158,11,0.35)]",
    text: "text-amber-400 group-hover:text-amber-300",
    accentHex: "#f59e0b",
  },
  input: {
    border: "border-indigo-400/30 group-hover:border-indigo-300/70",
    bg: "bg-gradient-to-br from-indigo-500/15 via-blue-900/10 to-purple-950/20",
    glow: "shadow-[0_0_18px_rgba(99,102,241,0.35)]",
    text: "text-indigo-400 group-hover:text-indigo-300",
    accentHex: "#6366f1",
  },
  system: {
    border: "border-white/20 group-hover:border-white/40",
    bg: "bg-gradient-to-br from-white/10 via-white/5 to-transparent",
    glow: "shadow-[0_0_16px_rgba(255,255,255,0.15)]",
    text: "text-slate-200 group-hover:text-white",
    accentHex: "#f8fafc",
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
          className={`w-0.5 rounded-full bg-cyan-400 ${active ? "animate-pulse" : "opacity-40"}`}
        />
      ))}
    </span>
  );
}
