/**
 * Real brand marks from Simple Icons, rendered as a CSS mask so each one takes
 * the current text colour. That keeps them legible in both themes without
 * shipping two copies of every asset, and avoids text wordmarks standing in for
 * logos.
 *
 * Logos only. No category labels underneath: the mark is the credibility, and
 * "YouTube / video" tells a reader nothing they do not already know.
 */
/**
 * Every slug here is verified to resolve on the Simple Icons CDN. A missing
 * mark fails silently as an empty box, so do not add one without checking it.
 *
 * Microsoft Edge and Visual Studio Code are deliberately absent: Simple Icons
 * removed both under its trademark policy and they now 404. Those surfaces are
 * covered in the copy instead, because inventing a mark for someone else's
 * brand is not an option.
 *
 * The list mirrors the repository's own plugins/ directory.
 */
const TARGETS = [
  { slug: "googlechrome", name: "Google Chrome" },
  { slug: "firefoxbrowser", name: "Firefox" },
  { slug: "brave", name: "Brave" },
  { slug: "youtube", name: "YouTube" },
  { slug: "github", name: "GitHub" },
  { slug: "spotify", name: "Spotify" },
  { slug: "discord", name: "Discord" },
  { slug: "figma", name: "Figma" },
  { slug: "leetcode", name: "LeetCode" },
] as const;

export function Integrations() {
  return (
    <section
      aria-labelledby="targets-heading"
      className="mx-auto max-w-[1400px] px-6"
    >
      <div className="rule-fade" />
      <div className="flex flex-col gap-7 py-12 lg:flex-row lg:items-center lg:gap-14">
        <h2
          id="targets-heading"
          className="max-w-[22ch] text-[13.5px] leading-relaxed text-muted"
        >
          Built to drive the surfaces you already work in, your editor included.
        </h2>

        <ul className="flex flex-1 flex-wrap items-center gap-x-10 gap-y-7">
          {TARGETS.map((target) => (
            <li key={target.slug}>
              <span
                role="img"
                aria-label={target.name}
                className="block h-6 w-6 bg-muted transition-colors duration-200 hover:bg-ink"
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
            </li>
          ))}
        </ul>
      </div>
      <div className="rule-fade" />
    </section>
  );
}
