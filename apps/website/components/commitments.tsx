"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  ShieldCheckIcon,
  WifiSlashIcon,
  LockKeyIcon,
  CheckCircleIcon,
  ArrowCounterClockwiseIcon,
} from "@phosphor-icons/react";
import { PrivacySandboxVisual } from "./modality-visuals";

/**
 * Two core architectural commitments:
 * 1. Accessibility: Built as an inclusive control foundation, WCAG 2.2 AA compliant.
 * 2. Privacy: Local-first execution enclave, zero external data leakage.
 */

export function Accessibility() {
  const reduce = useReducedMotion();

  return (
    <section
      id="access"
      aria-labelledby="access-heading"
      className="border-y border-subtle/80 bg-surface/40"
    >
      <div className="mx-auto max-w-[1400px] px-6 py-12 lg:py-16">
        <div className="grid gap-6 lg:grid-cols-12 items-stretch">
          {/* Left Column: Mission Thesis Card */}
          <div className="flex flex-col justify-between rounded-2xl border border-subtle/80 bg-base p-6 lg:col-span-7 shadow-sm">
            <div>
              <p className="label-mono">Inclusion by Architecture</p>
              <motion.h2
                id="access-heading"
                initial={reduce ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-[2rem] leading-tight text-ink"
              >
                For many people, this is not a convenience. It is the only way
                in.
              </motion.h2>

              <p className="mt-4 text-[14px] leading-relaxed text-muted">
                Omnivra is built on an unconditional engineering guarantee:
                computer control must never be gated by standard physical
                hardware. Voice-only, gaze dwell, and single-switch paths are
                first-class runtimes, every surface is fully
                keyboard-accessible, and reduced motion settings provide
                verified non-animated functional equivalents.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-subtle/60 pt-4 font-mono text-[11px] text-muted">
              <span className="flex items-center gap-1.5 text-ink">
                <span className="h-1.5 w-1.5 rounded-full bg-active" />
                <span>WCAG 2.2 AA Standard</span>
              </span>
              <span>•</span>
              <span>100% Keyboard & Voice Reachable</span>
              <span>•</span>
              <span>CI Guardrails</span>
            </div>
          </div>

          {/* Right Column: 2 Structured Capability Bento Cards */}
          <div className="flex flex-col justify-between gap-4 lg:col-span-5">
            <div className="flex flex-col justify-between rounded-xl border border-subtle/80 bg-surface/90 p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 rounded-lg border border-active/30 bg-active/10 p-2 text-active">
                  <CheckCircleIcon size={18} weight="bold" />
                </span>
                <div>
                  <h3 className="font-display text-[15px] font-semibold text-ink">
                    WCAG 2.2 AA Floor
                  </h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted">
                    Contrast ratios (4.5:1 minimum), touch target sizes, focus
                    indicators, and screen-reader semantics are continuously
                    verified in CI test suites.
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-subtle/50 pt-2 font-mono text-[10.5px] text-muted">
                <span>Verification: Automated lint & Playwright</span>
                <span className="text-active">Passed</span>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-xl border border-subtle/80 bg-surface/90 p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 rounded-lg border border-accent/30 bg-accent/10 p-2 text-accent">
                  <ArrowCounterClockwiseIcon size={18} weight="bold" />
                </span>
                <div>
                  <h3 className="font-display text-[15px] font-semibold text-ink">
                    Graceful Degradation
                  </h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted">
                    Denying camera or microphone access never bricks the
                    runtime. Every interaction automatically falls back to
                    hotkeys, controllers, or pointer gestures.
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-subtle/50 pt-2 font-mono text-[10.5px] text-muted">
                <span>Fallback strategy: Cascading adapters</span>
                <span className="text-accent">Zero dead-ends</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const GUARANTEES = [
  {
    icon: <WifiSlashIcon size={18} />,
    title: "Recognition stays on your machine",
    body: "Camera frames and raw audio streams are processed locally in memory. Zero external egress.",
  },
  {
    icon: <LockKeyIcon size={18} />,
    title: "Capabilities are enforced boundaries",
    body: "Every action declares capability scopes and verifies explicit user permissions before dispatch.",
  },
  {
    icon: <ShieldCheckIcon size={18} />,
    title: "Cloud integrations are strictly opt-in",
    body: "No telemetry or background cloud sync is ever enabled without deliberate manual configuration.",
  },
] as const;

export function Privacy() {
  const reduce = useReducedMotion();

  return (
    <section
      id="privacy"
      aria-labelledby="privacy-heading"
      className="mx-auto grid max-w-[1400px] items-center gap-8 px-6 py-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12 lg:py-16"
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-subtle/80 bg-surface/90 sm:aspect-[4/3] lg:aspect-[5/4]">
        <PrivacySandboxVisual />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-base via-transparent to-accent/10"
        />
      </div>

      <div>
        <h2
          id="privacy-heading"
          className="max-w-[28ch] font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl"
        >
          Sensors stay local. Zero cloud egress.
        </h2>
        <p className="mt-2 max-w-[56ch] text-[14px] leading-relaxed text-muted">
          Omnivra treats microphones and cameras as strictly isolated hardware
          boundaries: raw media is processed in local memory, and status
          indicators are always clearly visible.
        </p>

        <ul className="mt-6 grid gap-2.5">
          {GUARANTEES.map((item) => (
            <motion.li
              key={item.title}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex gap-3.5 rounded-xl border border-subtle/80 bg-surface/70 p-4 transition-colors hover:border-accent/40"
            >
              <span className="mt-0.5 shrink-0 text-accent">{item.icon}</span>
              <div>
                <h3 className="font-display text-[13.5px] font-semibold text-ink">
                  {item.title}
                </h3>
                <p className="mt-0.5 max-w-[52ch] text-[12.5px] leading-relaxed text-muted">
                  {item.body}
                </p>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
