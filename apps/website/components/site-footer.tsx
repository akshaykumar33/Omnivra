import { GithubLogoIcon } from "@phosphor-icons/react/dist/ssr";

/**
 * Closing CTA and footer.
 *
 * The CTA label matches the nav and hero exactly ("Get the extension"). Three
 * different phrasings of the same intent across one page is the most common way
 * a landing page reads as machine-written.
 *
 * No version stamp, no locale strip, no build hash. Those belong on a devtool
 * surface, not here.
 */
const DOC_LINKS = [
  { href: "#inputs", label: "Inputs" },
  { href: "#pipeline", label: "How it works" },
  { href: "#access", label: "Accessibility" },
  { href: "#privacy", label: "Privacy" },
];

const PROJECT_LINKS = [
  { href: "https://github.com/akshaykumar33/Omnivra", label: "Repository" },
  {
    href: "https://github.com/akshaykumar33/Omnivra/blob/main/CONTRIBUTING.md",
    label: "Contributing",
  },
  {
    href: "https://github.com/akshaykumar33/Omnivra/blob/main/SECURITY.md",
    label: "Security policy",
  },
];

export function ClosingCta() {
  return (
    <section
      id="get"
      aria-labelledby="get-heading"
      className="relative isolate overflow-hidden border-t bg-surface"
    >
      {/* Bookend: the page opens and closes on the same colour field. */}
      <div className="aurora" aria-hidden="true">
        <div className="aurora__blob aurora__blob--two" />
        <div className="aurora__blob aurora__blob--three" />
      </div>
      <div className="mx-auto flex max-w-[1400px] flex-col items-start gap-8 px-6 py-24 lg:flex-row lg:items-center lg:justify-between lg:py-28">
        <div>
          <h2
            id="get-heading"
            className="max-w-[24ch] font-display text-3xl leading-tight font-semibold tracking-tight sm:text-4xl"
          >
            Omnivra is pre-1.0 and built in the open.
          </h2>
          <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-muted">
            The voice path is in alpha and the rest is being built in the
            sequence described above. Follow the repository to track it.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="#get"
            className="rounded-lg bg-accent px-5 py-2.5 text-[14px] font-semibold text-base transition-transform active:translate-y-px"
          >
            Get the extension
          </a>
          <a
            href="https://github.com/akshaykumar33/Omnivra"
            className="flex items-center gap-2 rounded-lg border px-5 py-2.5 text-[14px] font-semibold transition-colors hover:border-accent"
          >
            <GithubLogoIcon size={16} />
            View the source
          </a>
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <p className="font-display text-[15px] font-semibold tracking-tight">
            Omnivra
          </p>
          <p className="mt-2 max-w-[34ch] text-[13.5px] leading-relaxed text-muted">
            A programmable control layer for voice, gesture and gaze.
          </p>
        </div>

        <nav aria-label="On this page">
          <h2 className="text-[13px] font-semibold">On this page</h2>
          <ul className="mt-3 space-y-2">
            {DOC_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-[13.5px] text-muted transition-colors hover:text-ink"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Project">
          <h2 className="text-[13px] font-semibold">Project</h2>
          <ul className="mt-3 space-y-2">
            {PROJECT_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-[13.5px] text-muted transition-colors hover:text-ink"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="mx-auto max-w-[1400px] px-6 pb-10">
        <div className="rule-fade" />
        <p className="pt-6 text-[12.5px] text-muted">
          Apache-2.0 licensed. Built by Omnivra contributors.
        </p>
      </div>
    </footer>
  );
}
