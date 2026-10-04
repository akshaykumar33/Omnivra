"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
  MicrophoneIcon,
  HandIcon,
  PlayIcon,
  ArrowRightIcon,
  CodeIcon,
  ShieldCheckIcon,
  SpeakerHighIcon,
  SpeakerSlashIcon,
  CornersOutIcon,
  EyeIcon,
  KeyboardIcon,
} from "@phosphor-icons/react";
import { playClick, playSuccess } from "@/lib/sound";

export type PaletteAction = {
  id: string;
  title: string;
  category: "Actions" | "Navigation" | "Modalities" | "Diagnostics";
  shortcut?: string;
  icon: React.ReactNode;
  run: () => void;
};

export function CommandPalette({
  open,
  onClose,
  onSelectAction,
}: {
  open: boolean;
  onClose: () => void;
  onSelectAction?: (actionId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    onClose();
  };

  const toggleTheme = () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    playSuccess();
    onClose();
  };

  const actions: PaletteAction[] = [
    // Actions
    {
      id: "toggle-theme",
      title: "Toggle Dark / Light Theme",
      category: "Actions",
      shortcut: "⌘ / Ctrl + D",
      icon: <SunIcon size={16} />,
      run: toggleTheme,
    },
    {
      id: "run-pipeline-trace",
      title: "Run Architecture Pipeline Trace",
      category: "Actions",
      shortcut: "Enter",
      icon: <PlayIcon size={16} />,
      run: () => {
        scrollTo("pipeline");
        onSelectAction?.("run-pipeline-trace");
      },
    },
    {
      id: "toggle-sound",
      title: "Toggle Micro-Audio Haptics",
      category: "Actions",
      icon: <SpeakerHighIcon size={16} />,
      run: () => {
        const btn = document.querySelector(
          'button[aria-label*="interactive audio"]',
        ) as HTMLButtonElement;
        btn?.click();
        onClose();
      },
    },
    // Navigation
    {
      id: "nav-hero",
      title: "Jump to Multimodal Playground",
      category: "Navigation",
      shortcut: "Top",
      icon: <CornersOutIcon size={16} />,
      run: () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        onClose();
      },
    },
    {
      id: "nav-inputs",
      title: "Jump to Input Modalities Gallery",
      category: "Navigation",
      shortcut: "01-05",
      icon: <ArrowRightIcon size={16} />,
      run: () => scrollTo("inputs"),
    },
    {
      id: "nav-pipeline",
      title: "Jump to How It Works (7 Stages)",
      category: "Navigation",
      shortcut: "Arch",
      icon: <CodeIcon size={16} />,
      run: () => scrollTo("pipeline"),
    },
    {
      id: "nav-accessibility",
      title: "Jump to Accessibility Commitment (WCAG 2.2 AA)",
      category: "Navigation",
      icon: <ShieldCheckIcon size={16} />,
      run: () => scrollTo("access"),
    },
    {
      id: "nav-privacy",
      title: "Jump to Local Privacy & Machine Boundary",
      category: "Navigation",
      icon: <ShieldCheckIcon size={16} />,
      run: () => scrollTo("privacy"),
    },
    // Modalities
    {
      id: "mod-voice",
      title: "Inspect Voice Modality (Local Whisper Int8)",
      category: "Modalities",
      icon: <MicrophoneIcon size={16} className="text-voice" />,
      run: () => scrollTo("inputs"),
    },
    {
      id: "mod-gesture",
      title: "Inspect Hand Gesture Modality (MediaPipe 21 Joints)",
      category: "Modalities",
      icon: <HandIcon size={16} className="text-gesture" />,
      run: () => scrollTo("inputs"),
    },
    {
      id: "mod-gaze",
      title: "Inspect Eye Tracking Modality (Fixation & Dwell)",
      category: "Modalities",
      icon: <EyeIcon size={16} className="text-gaze" />,
      run: () => scrollTo("inputs"),
    },
    {
      id: "mod-keyboard",
      title: "Inspect Keyboard & Controller Modality (Compound)",
      category: "Modalities",
      icon: <KeyboardIcon size={16} className="text-input" />,
      run: () => scrollTo("inputs"),
    },
  ];

  const filtered = actions.filter(
    (act) =>
      act.title.toLowerCase().includes(query.toLowerCase()) ||
      act.category.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      playClick();
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
      playClick();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(
        (prev) => (prev - 1 + filtered.length) % (filtered.length || 1),
      );
      playClick();
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = filtered[selectedIndex];
      if (item) {
        item.run();
        playSuccess();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  // Group filtered by category
  const categories = Array.from(new Set(filtered.map((a) => a.category)));

  return (
    <AnimatePresence>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Omnivra Command Palette"
          className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[12vh] sm:pt-[15vh]"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-base/80 backdrop-blur-md"
          />

          {/* Palette Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl border bg-surface shadow-2xl"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 border-b px-4 py-3.5">
              <MagnifyingGlassIcon size={18} className="text-muted shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search commands, inputs, architecture, shortcuts..."
                className="w-full bg-transparent font-sans text-[15px] outline-none placeholder:text-muted/60 text-ink"
              />
              <kbd className="hidden sm:inline-block rounded border bg-raised px-2 py-0.5 font-mono text-[11px] text-muted">
                ESC
              </kbd>
            </div>

            {/* Results List */}
            <ul
              ref={listRef}
              role="listbox"
              className="max-h-[60vh] overflow-y-auto p-2"
            >
              {filtered.length === 0 ? (
                <li className="px-4 py-8 text-center text-[13.5px] text-muted">
                  No commands matching "{query}"
                </li>
              ) : (
                categories.map((cat) => {
                  const catItems = filtered.filter((a) => a.category === cat);
                  return (
                    <li key={cat} className="space-y-1 mb-2">
                      <div className="px-3 py-1 font-mono text-[10.5px] font-semibold text-muted tracking-wider uppercase">
                        {cat}
                      </div>
                      {catItems.map((action) => {
                        const globalIndex = filtered.indexOf(action);
                        const isSelected = globalIndex === selectedIndex;
                        return (
                          <div
                            key={action.id}
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              action.run();
                              playSuccess();
                            }}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                            className={`flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-[13.5px] transition-all ${
                              isSelected
                                ? "bg-accent/15 text-ink border border-accent/30 shadow-sm"
                                : "text-muted hover:text-ink"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={
                                  isSelected ? "text-accent" : "text-muted"
                                }
                              >
                                {action.icon}
                              </span>
                              <span className="font-medium">
                                {action.title}
                              </span>
                            </div>

                            {action.shortcut && (
                              <kbd className="rounded border bg-base px-2 py-0.5 font-mono text-[11px] text-muted">
                                {action.shortcut}
                              </kbd>
                            )}
                          </div>
                        );
                      })}
                    </li>
                  );
                })
              )}
            </ul>

            {/* Footer Navigation hints */}
            <div className="flex items-center justify-between border-t bg-base/50 px-4 py-2.5 font-mono text-[11px] text-muted">
              <div className="flex items-center gap-3">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
                <span>ESC Close</span>
              </div>
              <span className="text-accent">Omnivra Control Layer</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
