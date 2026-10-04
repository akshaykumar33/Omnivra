"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  ShieldCheckIcon,
  WifiSlashIcon,
  LockKeyIcon,
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
        <motion.h2
          id="access-heading"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[34ch] font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl"
        >
          For many people, this is not a convenience. It is the only way in.
        </motion.h2>

        <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-14">
          <p className="text-[14px] leading-relaxed text-muted">
            Omnivra is designed around an essential foundation: computer control
            must never be gated by standard hardware. Voice-only, gaze, and
            single-switch paths are first-class runtimes, all controls are
            keyboard-accessible, and reduced motion settings provide real
            working non-animated equivalents.
          </p>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-subtle/80 bg-base p-4">
              <dt className="font-display text-[14px] font-semibold text-ink">
                WCAG 2.2 AA floor
              </dt>
              <dd className="mt-1 text-[13px] leading-relaxed text-muted">
                Contrast ratios, target dimensions, focus visibility and
                screen-reader labels are tested in automated CI gates.
              </dd>
            </div>
            <div className="rounded-xl border border-subtle/80 bg-base p-4">
              <dt className="font-display text-[14px] font-semibold text-ink">
                Graceful degradation
              </dt>
              <dd className="mt-1 text-[13px] leading-relaxed text-muted">
                Deny camera permissions and other inputs continue functioning
                without breaking the runtime or modal dialogs.
              </dd>
            </div>
          </dl>
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
