import React from "react";

interface OmnivraLogoProps {
  size?: number;
  className?: string;
  glow?: boolean;
}

/**
 * Omnivra Brand Mark
 *
 * An interlocking Möbius-aperture forming the letter "O":
 * Three continuous multimodal strands (Voice frequency, Gesture orbit, Optical gaze)
 * converging into a unified deterministic action nexus.
 */
export function OmnivraLogo({
  size = 24,
  className = "",
  glow = false,
}: OmnivraLogoProps) {
  const idPrefix = React.useId().replace(/:/g, "");

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-300 ${className}`}
      aria-hidden="true"
    >
      <defs>
        {/* Core dynamic multi-spectrum gradient */}
        <linearGradient
          id={`${idPrefix}-strand-voice`}
          x1="4"
          y1="8"
          x2="28"
          y2="16"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>

        <linearGradient
          id={`${idPrefix}-strand-gesture`}
          x1="26"
          y1="14"
          x2="8"
          y2="28"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="60%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>

        <linearGradient
          id={`${idPrefix}-strand-gaze`}
          x1="6"
          y1="26"
          x2="16"
          y2="4"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="50%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>

        <radialGradient
          id={`${idPrefix}-core-glow`}
          cx="16"
          cy="16"
          r="8"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#f8fafc" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#38bdf8" stopOpacity="0.7" />
          <stop offset="85%" stopColor="#6366f1" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </radialGradient>

        {glow && (
          <filter
            id={`${idPrefix}-glow`}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        )}
      </defs>

      {/* Ambient background glow if requested */}
      {glow && (
        <circle
          cx="16"
          cy="16"
          r="12"
          fill={`url(#${idPrefix}-strand-voice)`}
          opacity="0.25"
          filter={`url(#${idPrefix}-glow)`}
        />
      )}

      {/* Strand 1: Voice Wave (Top & Upper Right Orbit) */}
      <path
        d="M 16 3.5 C 23.2 3.5 28.5 8.8 28.5 16 C 28.5 19.8 26.6 23.1 23.5 25.2 C 22.2 22.8 22 19.5 22.8 17 C 23.4 15 22.8 12.8 21.2 11.2 C 19.5 9.5 17 9 14.8 9.6 C 13.5 7.2 14.2 4.6 16 3.5 Z"
        fill={`url(#${idPrefix}-strand-voice)`}
        fillRule="evenodd"
      />

      {/* Strand 2: Gesture Trajectory (Lower Orbit & Right-to-Left Return) */}
      <path
        d="M 28.5 16 C 28.5 22.9 22.9 28.5 16 28.5 C 10.8 28.5 6.4 25.3 4.5 20.8 C 7.2 20.5 10.2 21.5 12 23.2 C 14.2 24.8 17.2 24.5 19.5 22.8 C 21.5 21.2 22.2 18.5 21.5 16.2 C 24 16.5 26.8 15.5 28.5 16 Z"
        fill={`url(#${idPrefix}-strand-gesture)`}
        fillRule="evenodd"
        opacity="0.92"
      />

      {/* Strand 3: Optical Gaze Arc (Left Orbit & Ascending Confluence) */}
      <path
        d="M 16 28.5 C 9.1 28.5 3.5 22.9 3.5 16 C 3.5 10.5 7.1 5.8 12.2 4.2 C 11.2 6.8 11.8 10 13.5 12 C 15.2 14 15.5 17 14.2 19.5 C 12.8 21.8 10.2 22.8 7.8 22.5 C 9.8 26.2 12.8 28.2 16 28.5 Z"
        fill={`url(#${idPrefix}-strand-gaze)`}
        fillRule="evenodd"
        opacity="0.88"
      />

      {/* Central Omnivra Aperture / Intent Nexus */}
      <circle cx="16" cy="16" r="3.2" fill={`url(#${idPrefix}-core-glow)`} />
      <circle cx="16" cy="16" r="1.4" fill="#ffffff" />
    </svg>
  );
}
