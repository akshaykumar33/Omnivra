"use client";

import { useEffect, useRef } from "react";

/**
 * A frequency meter driven by the real microphone stream.
 *
 * This is the page demonstrating its own thesis: the signal arriving from your
 * microphone is the same signal the recognition engine consumes, so showing it
 * raw is both the most honest visual available and the most alive one. There is
 * no synthetic animation here. Silence renders as silence.
 *
 * Drawn on canvas with a requestAnimationFrame loop that only exists while a
 * stream is attached, so an idle page costs nothing. Nothing touches React
 * state, so there is no re-render per frame.
 */
const BAR_COUNT = 56;

export function AudioBars({
  stream,
  reduced,
}: {
  stream: MediaStream | null;
  reduced: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Size the backing store to the device pixel ratio so bars stay crisp.
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const accent = getComputedStyle(document.documentElement)
      .getPropertyValue("--accent-primary")
      .trim();
    const muted = getComputedStyle(document.documentElement)
      .getPropertyValue("--border-subtle")
      .trim();

    let raf = 0;
    let audioContext: AudioContext | undefined;
    let analyser: AnalyserNode | undefined;
    let source: MediaStreamAudioSourceNode | undefined;
    // Typed over ArrayBuffer explicitly: TypeScript 5.7 made Uint8Array
    // generic over ArrayBufferLike, and getByteFrequencyData only accepts the
    // ArrayBuffer-backed form.
    let bins: Uint8Array<ArrayBuffer> | undefined;

    // Smoothed per-bar heights, so a bar falls away rather than snapping to 0.
    const levels = new Float32Array(BAR_COUNT);

    if (stream) {
      audioContext = new AudioContext();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = reduced ? 0.92 : 0.75;
      source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      bins = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
    }

    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);

      const gap = 2;
      const barWidth = (width - gap * (BAR_COUNT - 1)) / BAR_COUNT;
      const mid = height / 2;

      if (analyser && bins) {
        analyser.getByteFrequencyData(bins);
      }

      for (let i = 0; i < BAR_COUNT; i += 1) {
        let target = 0;
        if (bins) {
          // Spread the usable bins across the bars; the top of the range is
          // mostly empty for speech, so only the lower portion is sampled.
          const index = Math.floor((i / BAR_COUNT) * (bins.length * 0.7));
          target = (bins[index] ?? 0) / 255;
        }

        const current = levels[i] ?? 0;
        // Rise fast, fall slow: that is what reads as "responsive" rather than
        // twitchy, and it keeps a quiet room from flickering.
        levels[i] =
          target > current ? target : current + (target - current) * 0.18;

        const level = levels[i] ?? 0;
        const barHeight = Math.max(2, level * (height - 4));
        const x = i * (barWidth + gap);

        ctx.fillStyle = level > 0.02 ? accent : muted;
        ctx.globalAlpha = level > 0.02 ? 0.35 + level * 0.65 : 0.5;
        ctx.beginPath();
        ctx.roundRect(
          x,
          mid - barHeight / 2,
          barWidth,
          barHeight,
          barWidth / 2,
        );
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      source?.disconnect();
      analyser?.disconnect();
      void audioContext?.close();
    };
  }, [stream, reduced]);

  return (
    <canvas
      ref={canvasRef}
      // Decorative duplicate of the transcript's own live region: the text
      // below already announces what was heard, so this must not be announced.
      aria-hidden="true"
      className="h-14 w-full"
    />
  );
}
