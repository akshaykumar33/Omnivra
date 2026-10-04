"use client";

import { useState } from "react";

/**
 * Real brand marks from Simple Icons, rendered as a CSS mask so each one takes
 * the current text colour. That keeps them legible in both themes without
 * shipping two copies of every asset, and avoids text wordmarks standing in for
 * logos.
 */
const TARGETS = [
  {
    slug: "googlechrome",
    name: "Google Chrome",
    action: "Tab & scroll intents",
  },
  { slug: "firefoxbrowser", name: "Firefox", action: "Voice reader mode" },
  { slug: "brave", name: "Brave", action: "Shield & window controls" },
  { slug: "youtube", name: "YouTube", action: "Palm hold to pause" },
  { slug: "github", name: "GitHub", action: "Voice PR review & diff jump" },
  { slug: "spotify", name: "Spotify", action: "Flick volume & track skip" },
  { slug: "discord", name: "Discord", action: "Push-to-talk gaze mute" },
  { slug: "figma", name: "Figma", action: "Pinch zoom & canvas pan" },
  { slug: "leetcode", name: "LeetCode", action: "Voice 'Run tests' & submit" },
] as const;

export function Integrations() {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  return (
    <section
      aria-labelledby="targets-heading"
      className="mx-auto max-w-[1400px] px-6"
    >
      <div className="rule-fade" />
      <div className="flex flex-col gap-6 py-8 lg:flex-row lg:items-center lg:gap-12 lg:py-10">
        <div className="shrink-0">
          <h2
            id="targets-heading"
            className="max-w-[24ch] text-[13.5px] font-semibold leading-relaxed text-ink"
          >
            Built to drive the surfaces you already work in.
          </h2>
          <p className="mt-0.5 text-[12px] text-muted">
            Hover to view sample multimodal mappings.
          </p>
        </div>

        <ul className="flex flex-1 flex-wrap items-center gap-2">
          {TARGETS.map((target) => {
            const isHovered = activeSlug === target.slug;
            return (
              <li
                key={target.slug}
                onMouseEnter={() => setActiveSlug(target.slug)}
                onMouseLeave={() => setActiveSlug(null)}
                className="group relative"
              >
                <div
                  tabIndex={0}
                  role="button"
                  className="flex items-center gap-2 rounded-lg border border-subtle/80 bg-surface px-2.5 py-1.5 text-[12px] transition-all duration-200 hover:border-accent/60 hover:bg-raised focus-visible:border-accent"
                >
                  <span
                    role="img"
                    aria-label={target.name}
                    className="block h-4 w-4 bg-muted transition-colors duration-200 group-hover:bg-ink"
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
                  <span className="font-medium text-muted transition-colors group-hover:text-ink">
                    {target.name}
                  </span>
                  {isHovered && (
                    <span className="hidden font-mono text-[11px] text-accent sm:inline-block">
                      • {target.action}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="rule-fade" />
    </section>
  );
}
