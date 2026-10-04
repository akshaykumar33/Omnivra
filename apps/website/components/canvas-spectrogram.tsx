"use client";

import { useEffect, useRef } from "react";

/**
 * Real-time acoustic spectrum. Live when a MediaStream is attached, a slow
 * generative wave when idle.
 *
 * Canvas is not CSS: `fillStyle` and `addColorStop` are parsed by the 2D
 * context, which has no cascade and therefore no idea what `var(--hue-voice)`
 * means. Passing one to `addColorStop` throws a SyntaxError outright and takes
 * the React tree with it, so every colour here is resolved off the document
 * element first and cached as numeric channels.
 *
 * Voice commands can swap `data-theme` at runtime, so the palette is re-read
 * when that attribute changes rather than once at mount.
 */

type Rgb = readonly [number, number, number];

const FALLBACK_VOICE: Rgb = [34, 211, 238];
const FALLBACK_ACCENT: Rgb = [56, 189, 248];

/**
 * Normalises any CSS colour string through the 2D context, which rejects what
 * it cannot parse by leaving `fillStyle` untouched. Writing a different
 * sentinel before each attempt turns that silent rejection into a signal: a
 * value that parsed yields the same answer from both sentinels, one that did
 * not yields the two sentinels back.
 */
function normalise(
  ctx: CanvasRenderingContext2D,
  value: string,
): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  ctx.fillStyle = "#ff0000";
  ctx.fillStyle = trimmed;
  const first = ctx.fillStyle as string;

  ctx.fillStyle = "#00ff00";
  ctx.fillStyle = trimmed;
  const second = ctx.fillStyle as string;

  return first === second ? first : null;
}

function toRgb(
  ctx: CanvasRenderingContext2D,
  value: string,
  fallback: Rgb,
): Rgb {
  const normalised = normalise(ctx, value);
  if (!normalised) return fallback;

  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(normalised)?.[1];
  if (hex) {
    const body =
      hex.length === 3
        ? hex
            .split("")
            .map((c) => c + c)
            .join("")
        : hex;
    return [
      parseInt(body.slice(0, 2), 16),
      parseInt(body.slice(2, 4), 16),
      parseInt(body.slice(4, 6), 16),
    ];
  }

  const fn = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i.exec(
    normalised,
  );
  const [, r, g, b] = fn ?? [];
  if (r !== undefined && g !== undefined && b !== undefined) {
    return [
      Math.round(Number(r)),
      Math.round(Number(g)),
      Math.round(Number(b)),
    ];
  }

  return fallback;
}

const rgba = (c: Rgb, alpha: number) =>
  `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${alpha})`;

export function CanvasSpectrogram({
  stream,
  reduced = false,
  className = "",
}: {
  stream: MediaStream | null;
  reduced?: boolean;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const BIN_COUNT = 32;

  useEffect(() => {
    if (!stream) return;

    let source: MediaStreamAudioSourceNode | null = null;
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = audioContextRef.current ?? new AudioContextClass();
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      // fftSize 64 gives exactly BIN_COUNT bins.
      analyser.fftSize = BIN_COUNT * 2;
      analyser.smoothingTimeConstant = 0.8;

      source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      analyserRef.current = analyser;
      sourceRef.current = source;
    } catch {
      // No microphone, or the context was blocked: the idle wave still draws.
      analyserRef.current = null;
    }

    return () => {
      source?.disconnect();
      sourceRef.current = null;
      analyserRef.current = null;
    };
  }, [stream]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const root = document.documentElement;
    // Allocated once: a fresh Uint8Array every frame is 60 collections a second.
    const bins = new Uint8Array(BIN_COUNT);

    let voice = FALLBACK_VOICE;
    let accent = FALLBACK_ACCENT;

    const readPalette = () => {
      const styles = getComputedStyle(root);
      voice = toRgb(
        ctx,
        styles.getPropertyValue("--hue-voice"),
        FALLBACK_VOICE,
      );
      accent = toRgb(
        ctx,
        styles.getPropertyValue("--accent-primary"),
        FALLBACK_ACCENT,
      );
    };
    readPalette();

    // Voice commands rewrite data-theme; the palette has to follow.
    const themeWatcher = new MutationObserver(readPalette);
    themeWatcher.observe(root, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    // CSS sizes the element; the backing store has to match it times DPR or
    // every bar edge lands between pixels and the whole meter reads as mush.
    let cssWidth = 0;
    let cssHeight = 0;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cssWidth = rect.width;
      cssHeight = rect.height;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const sizeWatcher = new ResizeObserver(resize);
    sizeWatcher.observe(canvas);

    let frame = 0;
    let raf: number | null = null;

    const amplitudeAt = (index: number, live: boolean) => {
      if (live) return (bins[index] ?? 0) / 255;
      if (reduced) return 0.16;
      // Two detuned sines so the idle state breathes instead of looping.
      const t = frame * 0.03;
      const p = (index / BIN_COUNT) * Math.PI * 2;
      return 0.2 + 0.1 * Math.sin(t + p) + 0.05 * Math.sin(t * 1.7 + p * 2);
    };

    const render = () => {
      if (!cssWidth || !cssHeight) {
        raf = requestAnimationFrame(render);
        return;
      }

      const live = Boolean(stream && analyserRef.current);
      if (live) analyserRef.current!.getByteFrequencyData(bins);

      ctx.clearRect(0, 0, cssWidth, cssHeight);

      const gap = 3;
      const barWidth = Math.max(
        2,
        (cssWidth - (BIN_COUNT - 1) * gap) / BIN_COUNT,
      );

      // One gradient for the full height, not one per bar per frame.
      const grad = ctx.createLinearGradient(0, 0, 0, cssHeight);
      grad.addColorStop(0, rgba(voice, 0.95));
      grad.addColorStop(1, rgba(accent, 0.25));
      ctx.fillStyle = grad;

      ctx.beginPath();
      for (let i = 0; i < BIN_COUNT; i += 1) {
        const value = Math.max(0, Math.min(1, amplitudeAt(i, live)));
        const barHeight = Math.max(3, value * cssHeight * 0.88);
        ctx.roundRect(
          i * (barWidth + gap),
          cssHeight - barHeight,
          barWidth,
          barHeight,
          [2, 2, 0, 0],
        );
      }
      ctx.fill();

      // Crest line, tracing the tops.
      ctx.beginPath();
      ctx.strokeStyle = rgba(voice, 0.75);
      ctx.lineWidth = 1.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (let i = 0; i < BIN_COUNT; i += 1) {
        const value = Math.max(0, Math.min(1, amplitudeAt(i, live)));
        const barHeight = Math.max(3, value * cssHeight * 0.88);
        const x = i * (barWidth + gap) + barWidth / 2;
        const y = cssHeight - barHeight;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      frame += 1;
      // Reduced motion still gets a live meter when a stream is attached —
      // the bars then reflect real sound rather than invented animation.
      if (!reduced || live) raf = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (raf !== null) cancelAnimationFrame(raf);
      themeWatcher.disconnect();
      sizeWatcher.disconnect();
    };
  }, [stream, reduced]);

  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl border bg-base/70 p-3 ${className}`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-[10.5px] tracking-wider text-muted uppercase">
          Acoustic spectrum · {BIN_COUNT} bins
        </span>
        <span className="font-mono text-[10px] text-voice">
          {stream ? "LIVE" : "IDLE"}
        </span>
      </div>
      <canvas ref={canvasRef} className="block h-16 w-full" />
    </div>
  );
}
