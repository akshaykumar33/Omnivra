"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  MicrophoneIcon,
  HandIcon,
  EyeIcon,
  SmileyIcon,
  KeyboardIcon,
} from "@phosphor-icons/react";
import {
  VoiceVisual,
  GestureVisual,
  GazeVisual,
  FaceVisual,
  ClassicVisual,
} from "./modality-visuals";

gsap.registerPlugin(ScrollTrigger);

/**
 * The input gallery: vertical scroll drives a horizontal pan across five
 * full-height panels.
 *
 * Each panel is one input family and wears that family's hue, so the section
 * reads as a spectrum sweep from cyan to emerald as you move through it.
 *
 * Mechanics follow the canonical pinned-pan recipe exactly: pin the wrapper,
 * translate the inner track by (trackWidth - viewportWidth), and set the scroll
 * distance to that same number so the pan finishes precisely as the pin
 * releases. `start: "top top"` matters — anything else begins the pan before the
 * section is pinned and the first panel enters already half gone.
 *
 * Status labels stay honest here as everywhere: only voice is Alpha.
 */
type Panel = {
  readonly id: string;
  readonly index: string;
  readonly name: string;
  readonly line: string;
  readonly body: string;
  readonly status: "Alpha" | "Planned";
  readonly hue: string;
  readonly icon: React.ReactNode;
  readonly visual: React.ReactNode;
};

const PANELS: readonly Panel[] = [
  {
    id: "voice",
    index: "01",
    name: "Voice",
    line: "Say it.",
    body: "Wake words, continuous dictation and intent phrases. Recognition runs on your machine; nothing is streamed to a server.",
    status: "Alpha",
    hue: "var(--hue-voice)",
    icon: <MicrophoneIcon size={26} weight="duotone" />,
    visual: <VoiceVisual />,
  },
  {
    id: "gesture",
    index: "02",
    name: "Hand gestures",
    line: "Point at it.",
    body: "Pinch, palm, swipe and finger counts, read from the webcam and normalised into the same events as every other input.",
    status: "Planned",
    hue: "var(--hue-gesture)",
    icon: <HandIcon size={26} weight="duotone" />,
    visual: <GestureVisual />,
  },
  {
    id: "gaze",
    index: "03",
    name: "Eye tracking",
    line: "Look at it.",
    body: "Dwell targets, blink patterns and gaze regions, for the moments when a hand is not available at all.",
    status: "Planned",
    hue: "var(--hue-gaze)",
    icon: <EyeIcon size={26} weight="duotone" />,
    visual: <GazeVisual />,
  },
  {
    id: "face",
    index: "04",
    name: "Facial expression",
    line: "Mean it.",
    body: "Brow raises, head tilt and mouth shapes, used as modifiers rather than triggers so a sentence can change what a gesture does.",
    status: "Planned",
    hue: "var(--hue-face)",
    icon: <SmileyIcon size={26} weight="duotone" />,
    visual: <FaceVisual />,
  },
  {
    id: "classic",
    index: "05",
    name: "Keyboard and controllers",
    line: "Or just type.",
    body: "The inputs you already have, combinable with every modality before it. A gesture plus a held key is one trigger, not two.",
    status: "Planned",
    hue: "var(--hue-input)",
    icon: <KeyboardIcon size={26} weight="duotone" />,
    visual: <ClassicVisual />,
  },
];

export function Gallery() {
  const wrap = useRef<HTMLElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!wrap.current || !scroller.current || !track.current) return;

      /*
       * The markup ships as an ordinary horizontally scrollable region, and
       * only becomes a scroll-driven pan once GSAP has actually taken over.
       *
       * That order matters. If the pan were the default, anyone who never
       * reaches this branch — reduced motion, no JavaScript, a GSAP failure —
       * would be left with a `w-max` track inside an `overflow-hidden`
       * section, which is to say four of the five input families would be
       * silently unreachable. On a page whose whole argument is that no one
       * should be locked out by their input method, that is the one bug this
       * section cannot ship with.
       */
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const distance = () =>
        (track.current?.scrollWidth ?? 0) - window.innerWidth;

      // Nothing to pan across: leave the native scroller alone.
      if (distance() <= 0) return;

      const node = scroller.current;
      node.style.overflowX = "hidden";
      // GSAP drives the position now, so the element is no longer a scrollable
      // region and must stop advertising itself as a tab stop.
      node.removeAttribute("tabindex");
      node.removeAttribute("role");
      node.removeAttribute("aria-label");

      gsap.to(track.current, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: wrap.current,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });

      return () => {
        node.style.overflowX = "";
      };
    },
    { scope: wrap },
  );

  return (
    <section
      ref={wrap}
      id="inputs"
      aria-labelledby="gallery-heading"
      className="relative overflow-hidden border-y bg-base"
    >
      <h2 id="gallery-heading" className="sr-only">
        The five input families
      </h2>

      {/*
       * Scroller and track are separate elements on purpose: an element sized
       * `w-max` cannot scroll itself, so the overflow has to live on a
       * full-width parent for the no-pan fallback to work at any width.
       *
       * tabIndex makes the region keyboard-scrollable, which a bare
       * overflow container is not. Both it and the role are stripped above
       * once GSAP takes over and the element stops being scrollable.
       */}
      <div
        ref={scroller}
        tabIndex={0}
        role="region"
        aria-label="Input families, scroll horizontally"
        className="h-[100dvh] w-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-accent [&::-webkit-scrollbar]:hidden"
      >
        <div ref={track} className="flex h-full w-max items-center gap-6 px-6">
          {/* Lead-in panel, so the pan opens on a statement rather than a card. */}
          <article className="flex h-[74vh] w-[86vw] shrink-0 snap-center flex-col justify-end rounded-3xl border bg-surface p-10 lg:w-[38vw]">
            <p className="label-mono">The inputs</p>
            <p className="mt-5 font-display text-[clamp(2rem,1.4rem+2.4vw,3.5rem)] leading-[1.05] font-semibold tracking-tight">
              Five families.
              <br />
              <span className="text-muted">One rule format.</span>
            </p>
            <p className="mt-5 max-w-[34ch] text-[15px] leading-relaxed text-muted">
              Every modality normalises to the same event shape, so a rule
              written for a keyboard shortcut works for a gesture without being
              rewritten.
            </p>
          </article>

          {PANELS.map((panel) => (
            <article
              key={panel.id}
              style={{ "--glow": panel.hue } as React.CSSProperties}
              className="group relative flex h-[74vh] w-[86vw] shrink-0 snap-center flex-col justify-end overflow-hidden rounded-3xl border bg-surface p-10 transition-shadow duration-500 hover:glow-strong lg:w-[42vw]"
            >
              {panel.visual}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent"
              />

              {/* The panel's own hue, washing in from the top corner. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(130% 80% at 90% 0%, color-mix(in srgb, var(--glow) 26%, transparent), transparent 64%)",
                }}
              />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <span
                    className="font-mono text-[11px] tracking-[0.2em]"
                    style={{ color: panel.hue }}
                  >
                    {panel.index}
                  </span>
                  <span
                    data-alpha={panel.status === "Alpha"}
                    className="rounded-full border px-2.5 py-0.5 text-[10.5px] font-semibold tracking-wide text-muted uppercase data-[alpha=true]:border-active data-[alpha=true]:text-active"
                  >
                    {panel.status}
                  </span>
                </div>

                <span className="mt-8 block" style={{ color: panel.hue }}>
                  {panel.icon}
                </span>

                <p className="mt-5 font-display text-[clamp(2.25rem,1.6rem+2.6vw,4rem)] leading-[1] font-semibold tracking-tight">
                  {panel.line}
                </p>
                <h3 className="mt-4 text-[15px] font-semibold">{panel.name}</h3>
                <p className="mt-2 max-w-[38ch] text-[14px] leading-relaxed text-muted">
                  {panel.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
