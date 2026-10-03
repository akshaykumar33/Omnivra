"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRightIcon } from "@phosphor-icons/react";

/**
 * The architecture from architecture/multimodal-pipeline.md.
 *
 * This was first built as a 300vh scroll-pinned scrub. It froze the renderer
 * every time it entered the viewport, reproducibly, and a section that hangs
 * the page is worse than one that does not animate. So the pinning is gone:
 * the stages reveal on entry and respond to clicks and keyboard, which is
 * motion the sequence actually benefits from and which demonstrably works.
 *
 * If the scrub is wanted later it belongs behind a measured, profiled
 * implementation, not a second guess.
 */
const STAGES = [
  {
    name: "Input",
    detail:
      "A microphone, a webcam frame, a keypress. Raw signal, nothing more.",
  },
  {
    name: "Recognition",
    detail:
      "An engine turns signal into a candidate: a phrase, a landmark set, a gaze point. Runs on your machine.",
  },
  {
    name: "Normalised event",
    detail:
      "Every engine emits the same shape, so nothing downstream knows or cares which modality produced it.",
  },
  {
    name: "Context",
    detail:
      "What is focused, which host, which URL, which language. A rule can require any of it.",
  },
  {
    name: "Rule",
    detail:
      "Trigger plus conditions. Compound triggers let a gesture and a held key form one rule.",
  },
  {
    name: "Action",
    detail:
      "A capability request, not a raw command. Permission is checked before anything executes.",
  },
  {
    name: "Host adapter",
    detail:
      "The only layer that knows about Chrome, VS Code or the OS. Swap it and the core is unchanged.",
  },
] as const;

export function Pipeline() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();

  return (
    <section
      id="pipeline"
      aria-labelledby="pipeline-heading"
      className="border-y bg-surface"
    >
      <div className="mx-auto max-w-[1400px] px-6 py-24 lg:py-32">
        <p className="label-mono">How it works</p>
        <h2
          id="pipeline-heading"
          className="mt-4 max-w-[30ch] font-display text-3xl leading-tight font-semibold tracking-tight sm:text-4xl lg:text-5xl"
        >
          One path from signal to action.
        </h2>
        <p className="mt-5 max-w-[58ch] text-[15px] leading-relaxed text-muted">
          Seven stages, and only the last one knows what a browser is. Select
          any stage to read what it does.
        </p>

        <ol className="mt-12 grid gap-2 sm:grid-cols-2 lg:grid-cols-7 lg:gap-0">
          {STAGES.map((stage, i) => {
            const state =
              i === active ? "current" : i < active ? "done" : "upcoming";
            return (
              <motion.li
                key={stage.name}
                initial={reduce ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{
                  duration: 0.45,
                  delay: i * 0.05,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="relative"
              >
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  data-state={state}
                  aria-current={i === active ? "step" : undefined}
                  className="group w-full rounded-lg px-2 py-3 text-left transition-colors hover:bg-raised lg:px-3"
                >
                  {/*
                   * Rail segment. Each stage sits at its own point between the
                   * voice and gesture hues, so a completed rail reads as a
                   * spectrum running left to right rather than seven identical
                   * blue bars. The current stage also glows.
                   */}
                  <span
                    aria-hidden="true"
                    data-state={state}
                    style={
                      {
                        "--seg": `color-mix(in oklab, var(--hue-voice), var(--hue-gesture) ${(i / (STAGES.length - 1)) * 100}%)`,
                      } as React.CSSProperties
                    }
                    className="mb-3 block h-0.5 w-full rounded-full bg-subtle transition-all duration-500 data-[state=current]:bg-[var(--seg)] data-[state=current]:shadow-[0_0_14px_-1px_var(--seg)] data-[state=done]:bg-[var(--seg)]"
                  />
                  <span className="block font-mono text-[10.5px] tabular-nums text-muted opacity-70">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    data-state={state}
                    className="mt-1 block text-[13px] font-semibold text-muted transition-colors data-[state=current]:text-accent data-[state=done]:text-ink"
                  >
                    {stage.name}
                  </span>
                </button>
              </motion.li>
            );
          })}
        </ol>

        <div className="mt-8 flex min-h-[7rem] items-start gap-4 rounded-2xl border bg-base p-6">
          <ArrowRightIcon
            size={18}
            className="mt-0.5 shrink-0 text-accent"
            weight="bold"
          />
          <motion.p
            key={active}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[64ch] text-[15px] leading-relaxed"
          >
            <span className="font-display font-semibold">
              {STAGES[active]?.name}.
            </span>{" "}
            <span className="text-muted">{STAGES[active]?.detail}</span>
          </motion.p>
        </div>
      </div>
    </section>
  );
}
