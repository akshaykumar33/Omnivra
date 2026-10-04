"use client";

import React, { useState } from "react";
import { playClick } from "@/lib/sound";

/**
 * Bespoke technical artwork components for each modality and architectural guarantee.
 * Rendered as pure SVG/CSS visuals that respond directly to theme colors,
 * eliminating all third-party stock photo dependencies.
 */

/**
 * Quantises a generated coordinate before it reaches an attribute.
 *
 * `Math.sin` and `Math.cos` are not bit-identical across JavaScript engines —
 * the server renders under Node and the client re-renders under the browser,
 * and the two disagree in the last digit or two. React compares the rendered
 * attribute strings, so `151.38737803491827` against `151.38737803491824` is a
 * hydration mismatch that discards the whole tree. Two decimals is well past
 * sub-pixel for these viewBoxes and is identical everywhere.
 */
const svgNum = (value: number) => Math.round(value * 100) / 100;

export function VoiceVisual() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
    >
      <svg
        viewBox="0 0 600 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full object-cover opacity-60 transition-opacity duration-700 group-hover:opacity-85"
      >
        <defs>
          <linearGradient id="voice-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--hue-voice)" stopOpacity="0.8" />
            <stop
              offset="50%"
              stopColor="var(--accent-primary)"
              stopOpacity="0.4"
            />
            <stop
              offset="100%"
              stopColor="var(--hue-voice)"
              stopOpacity="0.05"
            />
          </linearGradient>
          <radialGradient id="voice-glow" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="var(--hue-voice)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="600" height="800" fill="url(#voice-glow)" />

        {/* Concentric Audio Frequency Rings */}
        <g
          stroke="var(--hue-voice)"
          strokeOpacity="0.2"
          strokeWidth="1"
          strokeDasharray="3 3"
        >
          <circle cx="300" cy="320" r="80" />
          <circle cx="300" cy="320" r="140" />
          <circle cx="300" cy="320" r="200" />
          <circle cx="300" cy="320" r="260" />
        </g>

        {/* Radial Decibel Ticks */}
        <g stroke="var(--hue-voice)" strokeOpacity="0.35" strokeWidth="1.5">
          {Array.from({ length: 36 }).map((_, i) => {
            const angle = (i * 10 * Math.PI) / 180;
            const r1 = 190 + (i % 3 === 0 ? 12 : 4);
            const r2 = 210;
            const x1 = svgNum(300 + Math.cos(angle) * r1);
            const y1 = svgNum(320 + Math.sin(angle) * r1);
            const x2 = svgNum(300 + Math.cos(angle) * r2);
            const y2 = svgNum(320 + Math.sin(angle) * r2);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
          })}
        </g>

        {/* Dynamic Voice Spectrogram Curves */}
        <path
          d="M 60 380 Q 140 240 220 330 T 380 290 T 540 370"
          stroke="url(#voice-grad)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 80 410 Q 180 280 280 340 T 460 310 T 560 400"
          stroke="var(--hue-voice)"
          strokeOpacity="0.5"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M 120 440 Q 240 350 340 380 T 500 420"
          stroke="var(--hue-voice)"
          strokeOpacity="0.25"
          strokeWidth="1"
          strokeDasharray="4 4"
          fill="none"
        />

        {/* Center Microphone Diaphragm Crosshair */}
        <circle
          cx="300"
          cy="320"
          r="32"
          fill="var(--bg-surface)"
          stroke="var(--hue-voice)"
          strokeWidth="2"
        />
        <circle cx="300" cy="320" r="8" fill="var(--hue-voice)" />
        <line
          x1="280"
          y1="320"
          x2="320"
          y2="320"
          stroke="var(--hue-voice)"
          strokeWidth="1"
        />
        <line
          x1="300"
          y1="300"
          x2="300"
          y2="340"
          stroke="var(--hue-voice)"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}

export function GestureVisual() {
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  return (
    <div
      aria-hidden="true"
      onPointerMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width - 0.5;
        const ny = (e.clientY - rect.top) / rect.height - 0.5;
        setTilt({
          rx: Math.round(-ny * 16),
          ry: Math.round(nx * 16),
        });
      }}
      onPointerLeave={() => setTilt({ rx: 0, ry: 0 })}
      className="pointer-events-auto absolute inset-0 overflow-hidden select-none [perspective:900px]"
    >
      <div
        style={{
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transformOrigin: "center center",
          transition: "transform 0.12s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        className="h-full w-full"
      >
        <svg
          viewBox="0 0 600 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full object-cover opacity-60 transition-opacity duration-700 group-hover:opacity-90"
        >
          <defs>
            <radialGradient id="gesture-glow" cx="50%" cy="40%" r="50%">
              <stop
                offset="0%"
                stopColor="var(--hue-gesture)"
                stopOpacity="0.22"
              />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect width="600" height="800" fill="url(#gesture-glow)" />

          {/* 3D Skeletal Hand Landmarks (21 Joints) */}
          {/* Wrist base */}
          <g
            stroke="var(--hue-gesture)"
            strokeOpacity="0.6"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            {/* Palm base to metacarpals */}
            <line x1="300" y1="520" x2="220" y2="440" />
            <line x1="300" y1="520" x2="265" y2="400" />
            <line x1="300" y1="520" x2="310" y2="390" />
            <line x1="300" y1="520" x2="355" y2="410" />
            <line x1="300" y1="520" x2="390" y2="450" />

            {/* Palm transverse arch */}
            <line x1="220" y1="440" x2="265" y2="400" />
            <line x1="265" y1="400" x2="310" y2="390" />
            <line x1="310" y1="390" x2="355" y2="410" />
            <line x1="355" y1="410" x2="390" y2="450" />

            {/* Thumb */}
            <line x1="220" y1="440" x2="180" y2="410" />
            <line x1="180" y1="410" x2="160" y2="370" />
            <line x1="160" y1="370" x2="175" y2="330" />

            {/* Index Finger (Pointing / Pinch vector) */}
            <line x1="265" y1="400" x2="260" y2="320" />
            <line x1="260" y1="320" x2="255" y2="260" />
            <line x1="255" y1="260" x2="250" y2="210" />

            {/* Middle Finger */}
            <line x1="310" y1="390" x2="310" y2="300" />
            <line x1="310" y1="300" x2="310" y2="235" />
            <line x1="310" y1="235" x2="310" y2="180" />

            {/* Ring Finger */}
            <line x1="355" y1="410" x2="360" y2="330" />
            <line x1="360" y1="330" x2="365" y2="270" />
            <line x1="365" y1="270" x2="370" y2="225" />

            {/* Pinky */}
            <line x1="390" y1="450" x2="410" y2="385" />
            <line x1="410" y1="385" x2="425" y2="335" />
            <line x1="425" y1="335" x2="435" y2="295" />
          </g>

          {/* Pinch Proximity Ring between Thumb Tip (175, 330) and Index (250, 210) */}
          <circle
            cx="210"
            cy="270"
            r="45"
            stroke="var(--hue-gesture)"
            strokeWidth="1.2"
            strokeDasharray="4 3"
            strokeOpacity="0.7"
          />
          <line
            x1="175"
            y1="330"
            x2="250"
            y2="210"
            stroke="var(--hue-gesture)"
            strokeWidth="1"
            strokeDasharray="2 2"
            strokeOpacity="0.8"
          />

          {/* 21 Keypoint Joint Circles */}
          {[
            [300, 520],
            [220, 440],
            [265, 400],
            [310, 390],
            [355, 410],
            [390, 450],
            [180, 410],
            [160, 370],
            [175, 330],
            [260, 320],
            [255, 260],
            [250, 210],
            [310, 300],
            [310, 235],
            [310, 180],
            [360, 330],
            [365, 270],
            [370, 225],
            [410, 385],
            [425, 335],
            [435, 295],
          ].map(([x, y], idx) => (
            <g key={idx}>
              <circle
                cx={x}
                cy={y}
                r="5"
                fill="var(--bg-surface)"
                stroke="var(--hue-gesture)"
                strokeWidth="1.5"
              />
              <circle cx={x} cy={y} r="2" fill="var(--hue-gesture)" />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

export function GazeVisual() {
  const [reticle, setReticle] = useState({ x: 300, y: 320 });

  return (
    <div
      aria-hidden="true"
      onPointerMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width;
        const ny = (e.clientY - rect.top) / rect.height;
        setReticle({
          x: Math.round(270 + nx * 60),
          y: Math.round(290 + ny * 60),
        });
      }}
      onPointerLeave={() => setReticle({ x: 300, y: 320 })}
      className="pointer-events-auto absolute inset-0 overflow-hidden select-none"
    >
      <svg
        viewBox="0 0 600 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full object-cover opacity-60 transition-opacity duration-700 group-hover:opacity-90"
      >
        <defs>
          <radialGradient id="gaze-glow" cx="50%" cy="38%" r="50%">
            <stop offset="0%" stopColor="var(--hue-gaze)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="600" height="800" fill="url(#gaze-glow)" />

        {/* Eye Contour & Sclera Outline */}
        <path
          d="M 120 320 C 200 210, 400 210, 480 320 C 400 430, 200 430, 120 320 Z"
          stroke="var(--hue-gaze)"
          strokeWidth="1.8"
          strokeOpacity="0.5"
          fill="none"
        />

        {/* Iris Circle */}
        <circle
          cx={reticle.x}
          cy={reticle.y}
          r="68"
          stroke="var(--hue-gaze)"
          strokeWidth="2"
          strokeOpacity="0.75"
          fill="var(--bg-surface)"
          fillOpacity="0.4"
          className="transition-all duration-75 ease-out"
        />

        {/* Pupil & Dwell Progress Ring */}
        <circle
          cx={reticle.x}
          cy={reticle.y}
          r="28"
          fill="var(--hue-gaze)"
          fillOpacity="0.9"
          className="transition-all duration-75 ease-out"
        />
        <circle
          cx={reticle.x}
          cy={reticle.y}
          r="44"
          stroke="var(--hue-gaze)"
          strokeWidth="2.5"
          strokeDasharray="180 90"
          strokeLinecap="round"
          className="transition-all duration-75 ease-out"
        />

        {/* Gaze Reticle & Coordinate Crosshairs */}
        <g stroke="var(--hue-gaze)" strokeWidth="1" strokeOpacity="0.4">
          <line
            x1="80"
            y1={reticle.y}
            x2="520"
            y2={reticle.y}
            strokeDasharray="3 3"
          />
          <line
            x1={reticle.x}
            y1="120"
            x2={reticle.x}
            y2="520"
            strokeDasharray="3 3"
          />
        </g>

        {/* Saccade Trajectory Scanpath */}
        <path
          d="M 160 480 L 220 380 L 300 320 L 410 260 L 460 340"
          stroke="var(--hue-gaze)"
          strokeWidth="1.2"
          strokeDasharray="4 4"
          strokeOpacity="0.6"
        />
        {[
          [160, 480],
          [220, 380],
          [410, 260],
          [460, 340],
        ].map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="3"
            fill="var(--hue-gaze)"
            opacity="0.6"
          />
        ))}
      </svg>
    </div>
  );
}

export function FaceVisual() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
    >
      <svg
        viewBox="0 0 600 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full object-cover opacity-60 transition-opacity duration-700 group-hover:opacity-85"
      >
        <defs>
          <radialGradient id="face-glow" cx="50%" cy="38%" r="50%">
            <stop offset="0%" stopColor="var(--hue-face)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="600" height="800" fill="url(#face-glow)" />

        {/* Facial Mesh Triangulation Wireframe */}
        <g
          stroke="var(--hue-face)"
          strokeOpacity="0.4"
          strokeWidth="1"
          strokeLinejoin="round"
        >
          {/* Forehead / Brow lines */}
          <polygon points="300,160 230,190 300,210 370,190" />
          <polygon points="230,190 180,240 240,250 300,210" />
          <polygon points="370,190 300,210 360,250 420,240" />

          {/* Eye Orbit Nodes */}
          <polygon points="240,250 200,270 250,290 280,270" />
          <polygon points="360,250 320,270 350,290 400,270" />

          {/* Nose Bridge and Tip */}
          <polygon points="300,210 280,270 300,340 320,270" />
          <polygon points="300,340 270,360 300,380 330,360" />

          {/* Cheeks and Mouth contour */}
          <polygon points="270,360 230,390 270,430 300,380" />
          <polygon points="330,360 300,380 330,430 370,390" />
          <polygon points="300,380 270,430 300,450 330,430" />

          {/* Jawline contour */}
          <polyline points="180,240 170,360 210,480 300,540 390,480 430,360 420,240" />
          <line x1="210" y1="480" x2="270" y2="430" />
          <line x1="390" y1="480" x2="330" y2="430" />
          <line x1="300" y1="540" x2="300" y2="450" />
        </g>

        {/* Feature Action Unit Indicators */}
        {[
          [300, 160],
          [230, 190],
          [370, 190],
          [300, 210],
          [240, 250],
          [360, 250],
          [300, 380],
          [300, 450],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3" fill="var(--hue-face)" />
        ))}
      </svg>
    </div>
  );
}

export function ClassicVisual() {
  const [activeKey, setActiveKey] = useState<string>("K");

  return (
    <div
      aria-hidden="true"
      className="pointer-events-auto absolute inset-0 overflow-hidden select-none"
    >
      <svg
        viewBox="0 0 600 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full object-cover opacity-60 transition-opacity duration-700 group-hover:opacity-90"
      >
        <defs>
          <radialGradient id="classic-glow" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="var(--hue-input)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="600" height="800" fill="url(#classic-glow)" />

        {/* Matrix Wiring Circuit */}
        <g stroke="var(--hue-input)" strokeOpacity="0.3" strokeWidth="1">
          {Array.from({ length: 6 }).map((_, i) => (
            <line
              key={`h-${i}`}
              x1="80"
              y1={220 + i * 50}
              x2="520"
              y2={220 + i * 50}
            />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <line
              key={`v-${i}`}
              x1={100 + i * 55}
              y1="200"
              x2={100 + i * 55}
              y2="490"
            />
          ))}
        </g>

        {/* Interactive Clickable Keycap Matrix Switches */}
        {[
          { label: "CTRL", x: 120, y: 260, w: 70 },
          { label: "ALT", x: 200, y: 260, w: 60 },
          { label: "CMD", x: 270, y: 260, w: 70 },
          { label: "K", x: 350, y: 260, w: 55 },
          { label: "SPACE", x: 180, y: 330, w: 220 },
        ].map((key, i) => {
          const isPressed = activeKey === key.label;
          return (
            <g
              key={i}
              role="button"
              tabIndex={0}
              onClick={() => {
                setActiveKey(key.label);
                playClick();
              }}
              className="cursor-pointer transition-all duration-150"
            >
              <rect
                x={key.x}
                y={key.y + (isPressed ? 3 : 0)}
                width={key.w}
                height="45"
                rx="8"
                fill={isPressed ? "var(--hue-input)" : "var(--bg-surface)"}
                fillOpacity={isPressed ? 0.4 : 0.8}
                stroke="var(--hue-input)"
                strokeWidth={isPressed ? 2 : 1}
              />
              <text
                x={key.x + key.w / 2}
                y={key.y + 27 + (isPressed ? 3 : 0)}
                fill={isPressed ? "var(--hue-input)" : "var(--text-muted)"}
                fontFamily="var(--font-mono)"
                fontSize="12"
                fontWeight="600"
                textAnchor="middle"
              >
                {key.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function PrivacySandboxVisual() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
    >
      <svg
        viewBox="0 0 600 700"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full object-cover opacity-75"
      >
        <defs>
          <radialGradient id="priv-glow" cx="50%" cy="45%" r="55%">
            <stop
              offset="0%"
              stopColor="var(--accent-primary)"
              stopOpacity="0.25"
            />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="600" height="700" fill="url(#priv-glow)" />

        {/* Local Boundary Ring */}
        <circle
          cx="300"
          cy="340"
          r="190"
          stroke="var(--accent-primary)"
          strokeWidth="2"
          strokeDasharray="6 4"
          strokeOpacity="0.6"
        />
        <circle
          cx="300"
          cy="340"
          r="230"
          stroke="var(--border-subtle)"
          strokeWidth="1"
          strokeDasharray="3 3"
        />

        {/* Hardware Enclave Core */}
        <rect
          x="210"
          y="250"
          width="180"
          height="180"
          rx="20"
          fill="var(--bg-surface)"
          stroke="var(--accent-primary)"
          strokeWidth="2.5"
        />

        {/* Security Shield & Lock Icon */}
        <path
          d="M 300 280 L 350 305 V 345 C 350 380 300 405 300 405 C 300 405 250 380 250 345 V 305 Z"
          fill="var(--accent-primary)"
          fillOpacity="0.15"
          stroke="var(--accent-primary)"
          strokeWidth="2"
        />
        <circle cx="300" cy="335" r="10" fill="var(--accent-primary)" />
        <path
          d="M 300 345 V 360"
          stroke="var(--bg-surface)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Ingress Pipes (Local Mic, Camera, Sensors) */}
        <g stroke="var(--accent-primary)" strokeWidth="1.5" strokeOpacity="0.7">
          <line x1="80" y1="200" x2="210" y2="280" strokeDasharray="4 3" />
          <line x1="80" y1="480" x2="210" y2="400" strokeDasharray="4 3" />
          <line x1="520" y1="200" x2="390" y2="280" strokeDasharray="4 3" />
          <line x1="520" y1="480" x2="390" y2="400" strokeDasharray="4 3" />
        </g>

        {/* Architectural labels */}
        <g
          fill="var(--text-muted)"
          fontFamily="var(--font-mono)"
          fontSize="11"
          opacity="0.8"
        >
          <text x="80" y="190">
            Microphone input
          </text>
          <text x="80" y="500">
            Camera frames
          </text>
          <text x="520" y="190" textAnchor="end">
            Process isolated
          </text>
          <text x="520" y="500" textAnchor="end">
            Zero cloud egress
          </text>
        </g>

        <text
          x="300"
          y="460"
          fill="var(--accent-primary)"
          fontFamily="var(--font-mono)"
          fontSize="11"
          fontWeight="600"
          textAnchor="middle"
          letterSpacing="0.08em"
        >
          LOCAL EXECUTION ENCLAVE
        </text>
      </svg>
    </div>
  );
}
