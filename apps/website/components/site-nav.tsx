"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRightIcon,
  SunIcon,
  MoonIcon,
  SpeakerHighIcon,
  SpeakerSlashIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";
import {
  isSoundEnabled,
  setSoundEnabled,
  initSoundPreference,
  playClick,
} from "@/lib/sound";
import { CommandPalette } from "./command-palette";
import { OmnivraLogo } from "./omnivra-logo";

const LINKS = [
  { href: "#inputs", label: "Inputs" },
  { href: "#pipeline", label: "How it works" },
  { href: "#access", label: "Accessibility" },
  { href: "#privacy", label: "Privacy" },
];

export function SiteNav() {
  const [lifted, setLifted] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [soundOn, setSoundOn] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Global Cmd+K / Ctrl+K hotkey
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    initSoundPreference();
    setSoundOn(isSoundEnabled());

    const currentTheme =
      document.documentElement.getAttribute("data-theme") ||
      (window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark");
    setTheme(currentTheme === "light" ? "light" : "dark");

    const observer = new MutationObserver(() => {
      const updated = document.documentElement.getAttribute("data-theme");
      if (updated === "light" || updated === "dark") {
        setTheme(updated);
      }
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  // IntersectionObserver sentinel for header lift state
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

  const toggleTheme = () => {
    playClick();
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playClick();
  };

  return (
    <>
      <div
        id="nav-sentinel"
        aria-hidden="true"
        className="absolute top-0 h-px w-full"
      />
      <header
        data-lifted={lifted}
        className="sticky top-0 z-50 h-16 border-b border-transparent transition-colors duration-200 data-[lifted=true]:border-subtle data-[lifted=true]:bg-base/90 data-[lifted=true]:backdrop-blur-md"
      >
        <nav
          aria-label="Primary"
          className="mx-auto flex h-full max-w-[1400px] items-center justify-between gap-6 px-6"
        >
          <div className="flex items-center gap-3">
            <a href="#main" className="group flex items-center gap-2.5">
              <OmnivraLogo
                size={22}
                className="transition-transform group-hover:scale-105"
              />
              <span className="font-display text-[15px] font-semibold tracking-tight">
                Omnivra
              </span>
            </a>

            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10.5px] text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-active" />
              v0.1.0-alpha
            </span>
          </div>

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

          <div className="flex items-center gap-2.5">
            {/* Command Palette Trigger */}
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="flex items-center gap-2 rounded-lg border bg-base px-2.5 py-1.5 text-[12px] font-medium text-muted transition-colors hover:border-accent hover:text-ink"
              aria-label="Open Command Palette (Cmd+K)"
            >
              <MagnifyingGlassIcon size={14} />
              <span className="hidden md:inline">Commands</span>
              <kbd className="rounded border bg-raised px-1 py-0.5 font-mono text-[10px] text-muted">
                ⌘K
              </kbd>
            </button>

            {/* Audio Micro-feedback Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              aria-label={
                soundOn
                  ? "Mute interactive audio"
                  : "Enable interactive audio feedback"
              }
              title={soundOn ? "Sound enabled" : "Sound disabled"}
              className="flex h-9 w-9 items-center justify-center rounded-lg border text-muted transition-colors hover:border-accent hover:text-ink"
            >
              {soundOn ? (
                <SpeakerHighIcon
                  size={16}
                  weight="bold"
                  className="text-accent"
                />
              ) : (
                <SpeakerSlashIcon size={16} />
              )}
            </button>

            {/* Dark / Light Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              className="flex h-9 w-9 items-center justify-center rounded-lg border text-muted transition-colors hover:border-accent hover:text-ink"
            >
              {theme === "dark" ? (
                <SunIcon size={16} />
              ) : (
                <MoonIcon size={16} />
              )}
            </button>

            <a
              href="#get"
              className="flex shrink-0 items-center gap-1.5 rounded-[var(--radius-control)] border px-3.5 py-2 text-[13px] font-semibold whitespace-nowrap transition-colors hover:border-accent active:translate-y-px"
            >
              {/*
               * The full label plus the logo, the search button and two icon
               * buttons stop fitting on one line somewhere under 480px, and
               * `whitespace-nowrap` turns that from a wrap into an overflow.
               * Below that width the label shortens instead.
               */}
              <span className="max-[479px]:hidden">Get the extension</span>
              <span className="min-[480px]:hidden">Get it</span>
              <ArrowUpRightIcon size={13} weight="bold" />
            </a>
          </div>
        </nav>
      </header>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
      />
    </>
  );
}
