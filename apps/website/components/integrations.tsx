"use client";

import { useState } from "react";

/**
 * Real brand marks from Simple Icons, rendered as a CSS mask so each one takes
 * the current text colour cleanly across light and dark themes.
 */
const TARGETS = [
  {
    slug: "googlechrome",
    name: "Google Chrome",
    category: "Browser",
    action: "Voice tab navigation, gaze scrolling & omnibox dispatch",
  },
  {
    slug: "github",
    name: "GitHub",
    category: "Developer",
    action: "Voice PR reviews, diff inspection & automated checkout",
  },
  {
    slug: "figma",
    name: "Figma",
    category: "Design",
    action: "Pinch zoom, continuous canvas pan & gesture tool cycling",
  },
  {
    slug: "youtube",
    name: "YouTube",
    category: "Streaming",
    action: "Palm hold to pause, swipe left/right to scrub 10 seconds",
  },
  {
    slug: "spotify",
    name: "Spotify",
    category: "Audio",
    action: "Directional flick to skip tracks, dwell to adjust volume",
  },
  {
    slug: "discord",
    name: "Discord",
    category: "Communication",
    action: "Push-to-talk gaze mute & hands-free channel switching",
  },
  {
    slug: "brave",
    name: "Brave",
    category: "Browser",
    action: "Shield toggles, session isolation & window management",
  },
  {
    slug: "firefoxbrowser",
    name: "Firefox",
    category: "Browser",
    action: "Voice reader mode, bookmark search & audio muting",
  },
  {
    slug: "leetcode",
    name: "LeetCode",
    category: "Workflow",
    action: "Voice 'Run tests', automated submission & console toggles",
  },
] as const;

export function Integrations() {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  return (
    <section
      aria-labelledby="targets-heading"
      className="mx-auto max-w-[1400px] px-6 py-12 lg:py-16"
    >
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="label-mono">Ecosystem</p>
          <h2
            id="targets-heading"
            className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl text-ink"
          >
            Built to drive the surfaces you live in.
          </h2>
        </div>
        <p className="max-w-[48ch] text-[13.5px] leading-relaxed text-muted">
          Omnivra normalizes inputs before dispatch, so the same multimodal
          trigger controls web apps, desktop tools, and local development
          environments.
        </p>
      </div>

      {/* 3x3 Interactive Capability Matrix */}
      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TARGETS.map((target) => {
          const isActive = activeSlug === target.slug;
          return (
            <div
              key={target.slug}
              onMouseEnter={() => setActiveSlug(target.slug)}
              onMouseLeave={() => setActiveSlug(null)}
              className="group relative flex flex-col justify-between rounded-xl border border-subtle/80 bg-surface/90 p-4 transition-all duration-200 hover:border-accent/60 hover:bg-raised/70 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    role="img"
                    aria-label={target.name}
                    className="block h-5 w-5 bg-muted transition-colors duration-200 group-hover:bg-accent"
                    style={{
                      maskImage: `url(https://cdn.simpleicons.org/${target.slug})`,
                      WebkitMaskImage: `url(https://cdn.simpleicons.org/${target.slug})`,
                      maskSize: "contain",
                      WebkitMaskSize: "contain",
                      maskRepeat: "no-repeat",
                      WebkitMaskRepeat: "no-repeat",
                      maskPosition: "center",
                      WebkitMaskPosition: "center",
                    }}
                  />
                  <span className="font-display text-[14px] font-semibold text-ink">
                    {target.name}
                  </span>
                </div>
                <span className="rounded-full border border-subtle/90 bg-base px-2 py-0.5 font-mono text-[10px] font-medium text-ink/80 uppercase">
                  {target.category}
                </span>
              </div>

              <p className="mt-3 text-[12.5px] leading-relaxed text-muted group-hover:text-ink/90 transition-colors">
                {target.action}
              </p>

              <div className="mt-4 flex items-center justify-between border-t border-subtle/60 pt-2.5 font-mono text-[10.5px] text-muted">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-active" />
                  <span>Adapter ready</span>
                </span>
                <span className="text-accent/90 transition-transform duration-200 group-hover:translate-x-0.5">
                  Capability bound →
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
