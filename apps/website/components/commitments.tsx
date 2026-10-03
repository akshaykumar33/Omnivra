"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import {
  ShieldCheckIcon,
  WifiSlashIcon,
  LockKeyIcon,
} from "@phosphor-icons/react";

/**
 * Two sections, two different layout families: Accessibility is a full-width
 * statement because the claim is the content, and Privacy is a split with a
 * real image. Neither carries an eyebrow; the page's eyebrow budget is spent.
 */

export function Accessibility() {
  const reduce = useReducedMotion();

  return (
    <section
      id="access"
      aria-labelledby="access-heading"
      className="border-y bg-surface"
    >
      <div className="mx-auto max-w-[1400px] px-6 py-24 lg:py-32">
        <motion.h2
          id="access-heading"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[34ch] font-display text-3xl leading-[1.15] font-semibold tracking-tight sm:text-4xl lg:text-[3.25rem]"
        >
          For many people, this is not a convenience. It is the only way in.
        </motion.h2>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <p className="text-[15.5px] leading-relaxed text-muted">
            Omnivra started as a control layer, but the people it matters most
            to are those who cannot use a keyboard and mouse the way they are
            assumed to. That shapes the engineering: keyboard-only and
            voice-only paths are first-class, every control is reachable without
            a pointer, and reduced motion is a working equivalent rather than a
            disabled animation.
          </p>
          <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
            <div>
              <dt className="font-display text-[15px] font-semibold">
                WCAG 2.2 AA as the floor
              </dt>
              <dd className="mt-1.5 text-[14px] leading-relaxed text-muted">
                Contrast, target size, focus visibility and screen-reader
                labelling are checked in CI, not at the end.
              </dd>
            </div>
            <div>
              <dt className="font-display text-[15px] font-semibold">
                No modality is required
              </dt>
              <dd className="mt-1.5 text-[14px] leading-relaxed text-muted">
                Deny the camera and the rest still works. Every capability
                degrades instead of dead-ending.
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
    body: "Camera frames and audio are processed locally. Raw media never leaves the process.",
  },
  {
    icon: <LockKeyIcon size={18} />,
    title: "Permissions are boundaries",
    body: "Every action declares the capability it needs, and it is checked before execution.",
  },
  {
    icon: <ShieldCheckIcon size={18} />,
    title: "Cloud is optional",
    body: "Sync and AI providers are opt-in. Nothing is enabled on your behalf.",
  },
] as const;

export function Privacy() {
  const reduce = useReducedMotion();

  return (
    <section
      id="privacy"
      aria-labelledby="privacy-heading"
      className="mx-auto grid max-w-[1400px] items-center gap-12 px-6 py-24 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:py-32"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border lg:aspect-[3/4]">
        <Image
          src="https://picsum.photos/seed/omnivra-local-machine-desk-night/900/1200"
          alt="A workstation lit only by its own screen"
          fill
          sizes="(max-width: 1024px) 100vw, 40vw"
          className="object-cover opacity-45 grayscale"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-tr from-base via-base/55 to-accent/10"
        />
      </div>

      <div>
        <h2
          id="privacy-heading"
          className="max-w-[28ch] font-display text-3xl leading-tight font-semibold tracking-tight sm:text-4xl lg:text-5xl"
        >
          A camera and a microphone are a lot to ask for.
        </h2>
        <p className="mt-5 max-w-[56ch] text-[15.5px] leading-relaxed text-muted">
          So the default is that nothing leaves your device, and the indicator
          telling you when either one is live is never hidden.
        </p>

        <ul className="mt-10 grid gap-px overflow-hidden rounded-2xl border bg-subtle">
          {GUARANTEES.map((item) => (
            <motion.li
              key={item.title}
              initial={reduce ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex gap-4 bg-surface p-5"
            >
              <span className="mt-0.5 text-accent">{item.icon}</span>
              <div>
                <h3 className="font-display text-[14.5px] font-semibold">
                  {item.title}
                </h3>
                <p className="mt-1 max-w-[52ch] text-[13.5px] leading-relaxed text-muted">
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
