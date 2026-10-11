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
                      ? "bg-gradient-to-r from-[#d96b43] via-[#d97706] to-[#e09f52] bg-clip-text text-transparent font-medium"
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

      {/* Live Modality Signal Telemetry Grid — Claude Warm Aesthetic */}
      <div
        data-reveal="sub"
        className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 max-w-[560px]"
      >
        <div className="flex items-center gap-2 rounded-lg border border-orange-500/25 bg-orange-950/20 px-2.5 py-1.5 backdrop-blur-sm shadow-[0_0_12px_rgba(217,107,67,0.12)] transition-all hover:border-orange-400/60 hover:shadow-[0_0_16px_rgba(217,107,67,0.25)]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-400" />
          </span>
          <div className="min-w-0">
            <span className="block font-mono text-[10px] font-semibold text-orange-300 uppercase">
              Voice
            </span>
            <span className="block truncate font-mono text-[9.5px] text-muted">
              16kHz PCM
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-amber-500/25 bg-amber-950/20 px-2.5 py-1.5 backdrop-blur-sm shadow-[0_0_12px_rgba(217,119,6,0.12)] transition-all hover:border-amber-400/60 hover:shadow-[0_0_16px_rgba(217,119,6,0.25)]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
          </span>
          <div className="min-w-0">
            <span className="block font-mono text-[10px] font-semibold text-amber-300 uppercase">
              Gesture
            </span>
            <span className="block truncate font-mono text-[9.5px] text-muted">
              21 Landmarks
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-lime-600/25 bg-lime-950/20 px-2.5 py-1.5 backdrop-blur-sm shadow-[0_0_12px_rgba(101,163,13,0.12)] transition-all hover:border-lime-500/60 hover:shadow-[0_0_16px_rgba(101,163,13,0.25)]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-lime-400" />
          </span>
          <div className="min-w-0">
            <span className="block font-mono text-[10px] font-semibold text-lime-300 uppercase">
              Gaze
            </span>
            <span className="block truncate font-mono text-[9.5px] text-muted">
              120Hz Glint
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-stone-500/25 bg-stone-900/30 px-2.5 py-1.5 backdrop-blur-sm shadow-[0_0_12px_rgba(168,162,158,0.1)] transition-all hover:border-stone-400/60 hover:shadow-[0_0_16px_rgba(168,162,158,0.2)]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-stone-300 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-stone-300" />
          </span>
          <div className="min-w-0">
            <span className="block font-mono text-[10px] font-semibold text-stone-300 uppercase">
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
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c85a32] via-[#d96b43] to-[#d97706] px-6 py-3 text-[14px] font-semibold text-white shadow-[0_0_24px_rgba(200,90,50,0.35)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_36px_rgba(200,90,50,0.55)] active:scale-[0.98]"
            >
              Get the extension
            </a>
          </Magnetic>
        </span>

        <span data-reveal="cta">
          <a
            href="#pipeline"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-surface/80 px-5 py-3 text-[14px] font-semibold backdrop-blur-md transition-all hover:border-orange-500/40 hover:bg-surface hover:shadow-[0_0_20px_rgba(200,90,50,0.15)]"
          >
            See how it works
            <ArrowDown size={14} className="text-orange-400" />
          </a>
        </span>
      </div>
    </div>
  );
}
