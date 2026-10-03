"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import {
  MicrophoneIcon,
  HandIcon,
  EyeIcon,
  SmileyIcon,
  KeyboardIcon,
} from "@phosphor-icons/react";

/**
 * Status labels are load-bearing, not decoration.
 *
 * Only the voice path runs today, and the README requires every capability to
 * be marked Planned / Experimental / Alpha / Stable. A page that implied five
 * working engines would be lying, so the grid states where each one actually
 * is.
 */
type Status = "alpha" | "planned";

type Modality = {
  readonly id: string;
  readonly name: string;
  readonly blurb: string;
  readonly status: Status;
  readonly icon: React.ReactNode;
  readonly image?: { readonly seed: string; readonly alt: string };
  readonly span: string;
};

const MODALITIES: readonly Modality[] = [
  {
    id: "voice",
    name: "Voice",
    blurb:
      "Wake words, continuous dictation and intent phrases. Recognition runs locally; nothing is streamed to a server.",
    status: "alpha",
    icon: <MicrophoneIcon size={20} />,
    image: {
      seed: "omnivra-voice-studio-microphone",
      alt: "A microphone on a desk in low light",
    },
    span: "sm:col-span-2 sm:row-span-2",
  },
  {
    id: "gesture",
    name: "Hand gestures",
    blurb: "Pinch, palm, swipe and finger counts from the webcam.",
    status: "planned",
    icon: <HandIcon size={20} />,
    image: {
      seed: "omnivra-hand-gesture-motion",
      alt: "A hand caught mid-gesture against a dark background",
    },
    span: "",
  },
  {
    id: "gaze",
    name: "Eye tracking",
    blurb: "Dwell targets, blink patterns and gaze regions.",
    status: "planned",
    icon: <EyeIcon size={20} />,
    image: {
      seed: "omnivra-eye-closeup-detail",
      alt: "A close detail of an eye",
    },
    span: "",
  },
  {
    id: "face",
    name: "Facial expression",
    blurb: "Brow raises, head tilt and mouth shapes as modifiers.",
    status: "planned",
    icon: <SmileyIcon size={20} />,
    span: "",
  },
  {
    id: "classic",
    name: "Keyboard, mouse and controllers",
    blurb:
      "The inputs you already have, combinable with every modality above. A gesture plus a held key is one trigger.",
    status: "planned",
    icon: <KeyboardIcon size={20} />,
    span: "sm:col-span-2",
  },
];

const STATUS_COPY: Record<Status, string> = {
  alpha: "Alpha",
  planned: "Planned",
};

export function Inputs() {
  const reduce = useReducedMotion();

  return (
    <section
      id="inputs"
      aria-labelledby="inputs-heading"
      className="mx-auto max-w-[1400px] px-6 py-24 lg:py-32"
    >
      <p className="label-mono">Inputs</p>
      <h2
        id="inputs-heading"
        className="mt-4 max-w-[26ch] font-display text-3xl leading-tight font-semibold tracking-tight sm:text-4xl lg:text-5xl"
      >
        Five input families, one rule format.
      </h2>
      <p className="mt-5 max-w-[58ch] text-[15px] leading-relaxed text-muted">
        Every modality normalises to the same event shape, so a rule written for
        a keyboard shortcut works for a gesture without being rewritten.
      </p>

      <ul className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {MODALITIES.map((modality, index) => (
          <motion.li
            key={modality.id}
            initial={reduce ? false : { opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{
              duration: 0.55,
              delay: index * 0.07,
              ease: [0.16, 1, 0.3, 1],
            }}
            className={`group relative flex min-h-[13rem] flex-col justify-end overflow-hidden rounded-2xl border bg-surface p-5 ${modality.span}`}
          >
            {modality.image ? (
              <>
                <Image
                  src={`https://picsum.photos/seed/${modality.image.seed}/900/900`}
                  alt={modality.image.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover opacity-50 grayscale transition-opacity duration-500 group-hover:opacity-65"
                />
                {/*
                 * Scrim, not a veil: dark enough at the bottom for the text to
                 * clear WCAG AA, light enough at the top that the photograph
                 * still reads as a photograph.
                 */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-transparent"
                />
              </>
            ) : (
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,color-mix(in_srgb,var(--accent-primary)_16%,transparent),transparent_60%)]"
              />
            )}

            <div className="relative">
              <div className="flex items-center justify-between gap-3">
                <span className="text-accent">{modality.icon}</span>
                <span
                  data-status={modality.status}
                  className="rounded-full border px-2 py-0.5 text-[10.5px] font-semibold tracking-wide uppercase text-muted data-[status=alpha]:border-active data-[status=alpha]:text-active"
                >
                  {STATUS_COPY[modality.status]}
                </span>
              </div>
              <h3 className="mt-4 font-display text-[17px] font-semibold tracking-tight">
                {modality.name}
              </h3>
              <p className="mt-2 max-w-[42ch] text-[13.5px] leading-relaxed text-muted">
                {modality.blurb}
              </p>
            </div>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
