import { OmnivraLogo } from "./omnivra-logo";

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

function GithubIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

export function ClosingCta() {
  return (
    <section
      id="get"
      aria-labelledby="get-heading"
      className="relative isolate overflow-hidden border-t border-subtle/80 bg-surface/50 py-12 lg:py-16"
    >
      {/* Bookend: the page opens and closes on the same colour field. */}
      <div className="aurora" aria-hidden="true">
        <div className="aurora__blob aurora__blob--two" />
        <div className="aurora__blob aurora__blob--three" />
      </div>
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="relative flex flex-col justify-between gap-8 rounded-2xl border border-subtle/80 bg-surface/90 p-8 shadow-sm backdrop-blur-sm lg:flex-row lg:items-center lg:p-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-mono text-[11px] font-semibold text-accent uppercase">
              Open Development • v0.1.0-alpha
            </div>
            <h2
              id="get-heading"
              className="mt-3 max-w-[26ch] font-display text-2xl font-semibold tracking-tight sm:text-3xl text-ink"
            >
              Omnivra is pre-1.0 and built in the open.
            </h2>
            <p className="mt-2 max-w-[54ch] text-[14px] leading-relaxed text-muted">
              The voice path is in alpha and multimodal pipelines are being
              built in the sequence documented above. Clone the repository to
              build and run the kernel locally.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://github.com/akshaykumar33/Omnivra/releases/latest/download/omnivra-extension.zip"
              className="rounded-lg bg-accent px-5 py-2.5 text-[13.5px] font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-[0_0_24px_rgba(99,102,241,0.45)] active:translate-y-px"
            >
              Get the extension
            </a>
            <a
              href="https://github.com/akshaykumar33/Omnivra"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-lg border border-subtle/80 bg-surface px-4 py-2.5 text-[13.5px] font-semibold text-ink transition-colors hover:border-accent hover:bg-raised"
            >
              <GithubIcon className="h-4 w-4" />
              View source repository
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-subtle/80">
      <div className="mx-auto grid max-w-[1400px] gap-8 px-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2.5">
            <OmnivraLogo size={22} />
            <p className="font-display text-[15px] font-semibold tracking-tight">
              Omnivra
            </p>
          </div>
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

      <div className="mx-auto max-w-[1400px] px-6 pb-6">
        <div className="rule-fade" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-4 text-[12px] text-muted">
          <p>Apache-2.0 licensed. Built by Omnivra contributors.</p>
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="h-1.5 w-1.5 rounded-full bg-active animate-pulse" />
            <span className="text-ink/80">Local runtime healthy</span>
            <span className="text-subtle">•</span>
            <span>Zero cloud telemetry</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
