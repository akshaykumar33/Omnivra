"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowDownIcon } from "@phosphor-icons/react";
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
      <p data-reveal="eyebrow" className="label-mono">
        Multimodal control layer
      </p>

      <h1 className="mt-5 font-display text-[2.75rem] leading-[1.05] font-semibold tracking-tight sm:text-6xl lg:text-[4.5rem]">
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
                      ? "text-spectrum"
                      : "")
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
        className="mt-6 max-w-[48ch] text-[15.5px] leading-relaxed text-muted"
      >
        Map voice, gestures and gaze to anything your browser, editor or desktop
        can do. Local-first, and accessible by design.
      </p>

      <div className="mt-9 flex flex-wrap items-center gap-3">
        <span data-reveal="cta">
          <Magnetic>
            <a
              href="#get"
              style={
                { "--glow": "var(--accent-primary)" } as React.CSSProperties
              }
              className="glow-soft inline-block rounded-lg bg-accent px-5 py-2.5 text-[14px] font-semibold text-base transition-shadow duration-300 hover:[box-shadow:0_0_0_1px_color-mix(in_srgb,var(--accent-primary)_60%,transparent),0_0_34px_-4px_color-mix(in_srgb,var(--accent-primary)_60%,transparent)] active:translate-y-px"
            >
              Get the extension
            </a>
          </Magnetic>
        </span>

        <span data-reveal="cta">
          <a
            href="#pipeline"
            className="flex items-center gap-2 rounded-lg border px-5 py-2.5 text-[14px] font-semibold transition-colors hover:border-accent"
          >
            See how it works
            <ArrowDownIcon size={14} weight="bold" />
          </a>
        </span>
      </div>
    </div>
  );
}
