"use client";

import { useEffect, useState } from "react";
import { ArrowUpRightIcon } from "@phosphor-icons/react";

const LINKS = [
  { href: "#inputs", label: "Inputs" },
  { href: "#pipeline", label: "How it works" },
  { href: "#access", label: "Accessibility" },
  { href: "#privacy", label: "Privacy" },
];

export function SiteNav() {
  const [lifted, setLifted] = useState(false);

  // IntersectionObserver instead of a scroll listener: no per-frame work.
  useEffect(() => {
    const sentinel = document.getElementById("nav-sentinel");
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setLifted(!entry?.isIntersecting),
      { threshold: 1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div
        id="nav-sentinel"
        aria-hidden="true"
        className="absolute top-0 h-px w-full"
      />
      <header
        data-lifted={lifted}
        className="sticky top-0 z-50 h-16 border-b border-transparent transition-colors duration-200 data-[lifted=true]:border-subtle data-[lifted=true]:bg-base"
      >
        <nav
          aria-label="Primary"
          className="mx-auto flex h-full max-w-[1400px] items-center justify-between gap-6 px-6"
        >
          <a href="#main" className="flex items-center gap-2.5">
            <Mark />
            <span className="font-display text-[15px] font-semibold tracking-tight">
              Omnivra
            </span>
          </a>

          <ul className="hidden items-center gap-7 lg:flex">
            {LINKS.map((link) => (
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

          <a
            href="#get"
            className="flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-[13px] font-semibold transition-colors hover:border-accent"
          >
            Get the extension
            <ArrowUpRightIcon size={13} weight="bold" />
          </a>
        </nav>
      </header>
    </>
  );
}

/**
 * Three converging dots: many inputs resolving to one action. Kept to primitive
 * shapes rather than a drawn illustration.
 */
function Mark() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="4" cy="4" r="2.2" fill="var(--text-muted)" />
      <circle cx="4" cy="16" r="2.2" fill="var(--text-muted)" />
      <circle cx="16" cy="10" r="3" fill="var(--accent-primary)" />
      <path
        d="M6 5.2 L13.4 9 M6 14.8 L13.4 11"
        stroke="var(--border-subtle)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
