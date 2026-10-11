"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowDown } from "lucide-react";
import { Magnetic } from "./magnetic";

/**
 * The hero's text column, choreographed with GSAP.
 *
 * Deliberately a single-library component: GSAP owns every element in here and
 * Motion owns nothing, because two animation libraries fighting over the same
 * frames on the same nodes is how a hero ends up janky. The demo panel beside
 * it is a separate tree.
 *
 * The reveal is a mask wipe per word, not a fade. A fade says "content
 * arrived"; a wipe from behind a mask says "this was composed", which is the
 * difference the brief is asking for.
 */
const HEADLINE = [
  { text: "Any", tone: "ink" },
  { text: "input.", tone: "ink" },
  { text: "Any", tone: "muted" },
  { text: "logic.", tone: "muted" },
  { text: "Any", tone: "spectrum" },
  { text: "action.", tone: "spectrum" },
] as const;

export function HeroIntro() {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Honour the OS setting before building any timeline at all.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set("[data-reveal]", { opacity: 1, y: 0 });
        gsap.set("[data-word]", { yPercent: 0 });
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: "expo.out", duration: 1 },
      });

      tl.from("[data-word]", {
        yPercent: 118,
        stagger: 0.06,
        duration: 1.1,
      })
        .from(
          "[data-reveal='eyebrow']",
          { opacity: 0, y: 10, duration: 0.7 },
          0.1,
        )
        .from(
          "[data-reveal='sub']",
          { opacity: 0, y: 14, duration: 0.8 },
          "-=0.75",
        )
        .from(
          "[data-reveal='cta']",
          { opacity: 0, y: 14, stagger: 0.08, duration: 0.7 },
          "-=0.6",
        );
    },
    { scope },
  );

  return (
    <div ref={scope}>
      <div
        data-reveal="eyebrow"
        className="inline-flex items-center gap-2.5 rounded-full border border-accent/30 bg-accent/10 px-3.5 py-1.5 shadow-sm backdrop-blur-md"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-active opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-active" />
        </span>
        <span className="font-mono text-[11px] font-semibold tracking-wider text-accent uppercase">
          Local Multimodal Runtime
        </span>
        <span className="h-3 w-px bg-accent/30" />
        <span className="font-mono text-[11px] text-muted">v0.1.0-alpha</span>
      </div>

      <h1 className="mt-4 font-display text-[2.25rem] leading-[1.08] font-semibold tracking-tight sm:text-5xl lg:text-[3.5rem]">
        {/* Each word rides inside its own clipping mask. */}
        <span className="flex flex-wrap gap-x-[0.28em]">
          {HEADLINE.map((word, i) => (
            <span
              key={`${word.text}-${i}`}
              // pb/-mb give descenders room so the mask never clips a 'y' or 'g'.
              className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em]"
            >
              <span
                data-word
                className={
                  "inline-block " +
                  (word.tone === "muted"
                    ? "text-muted"
                    : word.tone === "spectrum"
                      ? "bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#06b6d4] bg-clip-text text-transparent font-medium"
                      : "text-ink")
                }
              >
                {word.text}
              </span>
            </span>
          ))}
        </span>
      </h1>

      <p
        data-reveal="sub"
        className="mt-4 max-w-[48ch] text-[15px] leading-relaxed text-muted"
      >
        Map voice, gestures and gaze to anything your browser, editor or desktop
        can do. Local-first, zero cloud egress, and accessible by design.
      </p>

      {/* Live Modality Signal Telemetry Grid */}
      <div
        data-reveal="sub"
        className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 max-w-[560px]"
      >
        <div className="flex items-center gap-2 rounded-lg border border-cyan-500/25 bg-cyan-950/20 px-2.5 py-1.5 backdrop-blur-sm shadow-[0_0_12px_rgba(6,182,212,0.15)] transition-all hover:border-cyan-400 hover:shadow-[0_0_16px_rgba(6,182,212,0.3)]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
          </span>
          <div className="min-w-0">
            <span className="block font-mono text-[10px] font-semibold text-cyan-300 uppercase">
              Voice
            </span>
            <span className="block truncate font-mono text-[9.5px] text-muted">
              16kHz PCM
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-purple-500/25 bg-purple-950/20 px-2.5 py-1.5 backdrop-blur-sm shadow-[0_0_12px_rgba(168,85,247,0.15)] transition-all hover:border-purple-400 hover:shadow-[0_0_16px_rgba(168,85,247,0.3)]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-400" />
          </span>
          <div className="min-w-0">
            <span className="block font-mono text-[10px] font-semibold text-purple-300 uppercase">
              Gesture
            </span>
            <span className="block truncate font-mono text-[9.5px] text-muted">
              21 Landmarks
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/25 bg-emerald-950/20 px-2.5 py-1.5 backdrop-blur-sm shadow-[0_0_12px_rgba(16,185,129,0.15)] transition-all hover:border-emerald-400 hover:shadow-[0_0_16px_rgba(16,185,129,0.3)]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <div className="min-w-0">
            <span className="block font-mono text-[10px] font-semibold text-emerald-300 uppercase">
              Gaze
            </span>
            <span className="block truncate font-mono text-[9.5px] text-muted">
              120Hz Glint
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-indigo-500/25 bg-indigo-950/20 px-2.5 py-1.5 backdrop-blur-sm shadow-[0_0_12px_rgba(99,102,241,0.15)] transition-all hover:border-indigo-400 hover:shadow-[0_0_16px_rgba(99,102,241,0.3)]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-400" />
          </span>
          <div className="min-w-0">
            <span className="block font-mono text-[10px] font-semibold text-indigo-300 uppercase">
              Keys
            </span>
            <span className="block truncate font-mono text-[9.5px] text-muted">
              Direct Switch
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <span data-reveal="cta">
          <Magnetic>
            <a
              href="#get"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 px-6 py-3 text-[14px] font-semibold text-white shadow-[0_0_24px_rgba(99,102,241,0.4)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_36px_rgba(99,102,241,0.65)] active:scale-[0.98]"
            >
              Get the extension
            </a>
          </Magnetic>
        </span>

        <span data-reveal="cta">
          <a
            href="#pipeline"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-surface/80 px-5 py-3 text-[14px] font-semibold backdrop-blur-md transition-all hover:border-cyan-400/50 hover:bg-surface hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]"
          >
            See how it works
            <ArrowDown size={14} className="text-cyan-400" />
          </a>
        </span>
      </div>
    </div>
  );
}
