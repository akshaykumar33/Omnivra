"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowDownIcon } from "@phosphor-icons/react";
import { VoiceDemo } from "./voice-demo";

/**
 * Asymmetric split hero: message left, live product right.
 *
 * The right column is the real thing running, not a screenshot of it, which is
 * the only honest way to open a page about an input platform.
 */
export function Hero() {
  const reduce = useReducedMotion();

  // Entry reveal communicates hierarchy: message first, then the demo.
  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] as const },
  });

  return (
    <section className="relative mx-auto grid max-w-[1400px] items-center gap-12 px-6 pt-16 pb-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pt-24">
      <div>
        <motion.p {...rise(0)} className="label-mono">
          Multimodal control layer
        </motion.p>

        <motion.h1
          {...rise(0.08)}
          className="mt-5 font-display text-[2.75rem] leading-[1.05] font-semibold tracking-tight sm:text-6xl lg:text-[4.25rem]"
        >
          Any input.
          <br />
          <span className="text-muted">Any logic.</span>{" "}
          <span className="text-accent">Any action.</span>
        </motion.h1>

        <motion.p
          {...rise(0.16)}
          className="mt-6 max-w-[48ch] text-[15.5px] leading-relaxed text-muted"
        >
          Map voice, gestures and gaze to anything your browser, editor or
          desktop can do. Local-first, and accessible by design.
        </motion.p>

        <motion.div
          {...rise(0.24)}
          className="mt-9 flex flex-wrap items-center gap-3"
        >
          <a
            href="#get"
            className="rounded-lg bg-accent px-5 py-2.5 text-[14px] font-semibold text-base transition-transform active:translate-y-px"
          >
            Get the extension
          </a>
          <a
            href="#pipeline"
            className="flex items-center gap-2 rounded-lg border px-5 py-2.5 text-[14px] font-semibold transition-colors hover:border-accent"
          >
            See how it works
            <ArrowDownIcon size={14} weight="bold" />
          </a>
        </motion.div>
      </div>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <VoiceDemo />
      </motion.div>
    </section>
  );
}
