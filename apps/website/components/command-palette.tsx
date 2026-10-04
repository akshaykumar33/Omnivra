"use client";

import { useEffect } from "react";
import { Command } from "cmdk";
import {
  SunIcon,
  MicrophoneIcon,
  HandIcon,
  PlayIcon,
  ArrowRightIcon,
  CodeIcon,
  ShieldCheckIcon,
  SpeakerHighIcon,
  CornersOutIcon,
  EyeIcon,
  KeyboardIcon,
} from "@phosphor-icons/react";
import { playClick, playSuccess } from "@/lib/sound";

/**
 * The command palette, built on cmdk.
 *
 * This was hand-rolled first and the hand-rolled version was quietly broken in
 * the ways palettes usually are: `role="option"` on plain divs with no
 * `aria-activedescendant` tying them back to the input, no focus trap, no
 * scroll-into-view as the selection moved past the fold, and plain substring
 * matching, so "pipeline trace" found nothing because the title says
 * "Architecture Pipeline Trace".
 *
 * cmdk is the library the pattern converged on. It supplies the combobox
 * semantics, fuzzy scoring, keyboard handling and a Radix-backed focus trap,
 * which leaves this file responsible only for the command list and the skin.
 */

type Action = {
  id: string;
  title: string;
  /** Extra search terms, so "shortcut" finds the theme toggle. */
  keywords?: string[];
  shortcut?: string;
  icon: React.ReactNode;
  run: () => void;
};

type Group = { heading: string; actions: Action[] };

export function CommandPalette({
  open,
  onClose,
  onSelectAction,
}: {
  open: boolean;
  onClose: () => void;
  onSelectAction?: (actionId: string) => void;
}) {
  useEffect(() => {
    if (open) playClick();
  }, [open]);

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    onClose();
  };

  const toggleTheme = () => {
    const root = document.documentElement;
    const explicit = root.getAttribute("data-theme");
    // With no explicit choice yet, read what the OS is actually giving us so
    // the first toggle flips away from what the viewer sees, not from a guess.
    const current =
      explicit ??
      (window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark");
    root.setAttribute("data-theme", current === "light" ? "dark" : "light");
    onClose();
  };

  const groups: Group[] = [
    {
      heading: "Actions",
      actions: [
        {
          id: "toggle-theme",
          title: "Switch between dark and light",
          keywords: ["theme", "appearance", "mode", "contrast"],
          shortcut: "Ctrl D",
          icon: <SunIcon size={16} />,
          run: toggleTheme,
        },
        {
          id: "run-pipeline-trace",
          title: "Run a pipeline trace",
          keywords: ["architecture", "stages", "animate", "event"],
          icon: <PlayIcon size={16} />,
          run: () => {
            onSelectAction?.("run-pipeline-trace");
            go("pipeline");
          },
        },
        {
          id: "toggle-sound",
          title: "Turn interface sound on or off",
          keywords: ["audio", "mute", "haptics"],
          icon: <SpeakerHighIcon size={16} />,
          run: () => {
            const button = document.querySelector<HTMLButtonElement>(
              'button[aria-label*="interactive audio"]',
            );
            button?.click();
            onClose();
          },
        },
      ],
    },
    {
      heading: "Go to",
      actions: [
        {
          id: "nav-hero",
          title: "Top of the page",
          keywords: ["hero", "start", "home"],
          icon: <CornersOutIcon size={16} />,
          run: () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
            onClose();
          },
        },
        {
          id: "nav-inputs",
          title: "The five input families",
          keywords: ["gallery", "modalities", "voice", "gesture"],
          icon: <ArrowRightIcon size={16} />,
          run: () => go("inputs"),
        },
        {
          id: "nav-pipeline",
          title: "How it works",
          keywords: ["architecture", "pipeline", "stages"],
          icon: <CodeIcon size={16} />,
          run: () => go("pipeline"),
        },
        {
          id: "nav-accessibility",
          title: "Accessibility",
          keywords: ["wcag", "a11y", "keyboard", "screen reader"],
          icon: <ShieldCheckIcon size={16} />,
          run: () => go("access"),
        },
        {
          id: "nav-privacy",
          title: "Privacy and the local boundary",
          keywords: ["local", "egress", "camera", "microphone"],
          icon: <ShieldCheckIcon size={16} />,
          run: () => go("privacy"),
        },
      ],
    },
    {
      heading: "Inputs",
      actions: [
        {
          id: "mod-voice",
          title: "Voice",
          keywords: ["speech", "dictation", "wake word", "alpha"],
          icon: <MicrophoneIcon size={16} className="text-voice" />,
          run: () => go("inputs"),
        },
        {
          id: "mod-gesture",
          title: "Hand gestures",
          keywords: ["pinch", "palm", "swipe", "webcam"],
          icon: <HandIcon size={16} className="text-gesture" />,
          run: () => go("inputs"),
        },
        {
          id: "mod-gaze",
          title: "Eye tracking",
          keywords: ["gaze", "dwell", "blink", "fixation"],
          icon: <EyeIcon size={16} className="text-gaze" />,
          run: () => go("inputs"),
        },
        {
          id: "mod-keyboard",
          title: "Keyboard and controllers",
          keywords: ["shortcut", "hotkey", "gamepad"],
          icon: <KeyboardIcon size={16} className="text-input" />,
          run: () => go("inputs"),
        },
      ],
    },
  ];

  return (
    <Command.Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      label="Command palette"
      shouldFilter
      // cmdk renders the overlay and positioner itself; these hooks let the
      // stylesheet animate them off Radix's data-state attribute.
      overlayClassName="omni-palette-overlay"
      contentClassName="omni-palette-content"
    >
      <div className="overflow-hidden rounded-[var(--radius-card)] border bg-surface glow-soft">
        <div className="flex items-center gap-3 border-b px-4 py-3.5">
          <Command.Input
            autoFocus
            placeholder="Search commands, inputs and sections"
            className="w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-muted/70"
          />
          <kbd className="hidden shrink-0 rounded-[var(--radius-control)] border bg-raised px-2 py-0.5 font-mono text-[11px] text-muted sm:inline-block">
            Esc
          </kbd>
        </div>

        <Command.List className="max-h-[min(60vh,26rem)] overflow-y-auto p-2">
          <Command.Empty className="px-4 py-10 text-center text-[13.5px] text-muted">
            Nothing matches that.
          </Command.Empty>

          {groups.map((group) => (
            <Command.Group
              key={group.heading}
              heading={group.heading}
              className="mb-1 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10.5px] [&_[cmdk-group-heading]]:tracking-[0.16em] [&_[cmdk-group-heading]]:text-muted [&_[cmdk-group-heading]]:uppercase"
            >
              {group.actions.map((action) => (
                <Command.Item
                  key={action.id}
                  value={`${action.title} ${(action.keywords ?? []).join(" ")}`}
                  onSelect={() => {
                    playSuccess();
                    action.run();
                  }}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-[var(--radius-control)] px-3 py-2.5 text-[13.5px] text-muted transition-colors data-[selected=true]:bg-accent/12 data-[selected=true]:text-ink"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="shrink-0 text-muted">{action.icon}</span>
                    <span className="truncate font-medium">{action.title}</span>
                  </span>
                  {action.shortcut ? (
                    <kbd className="hidden shrink-0 rounded border bg-base px-2 py-0.5 font-mono text-[11px] text-muted sm:inline-block">
                      {action.shortcut}
                    </kbd>
                  ) : null}
                </Command.Item>
              ))}
            </Command.Group>
          ))}
        </Command.List>

        <div className="flex items-center justify-between gap-3 border-t bg-base/60 px-4 py-2.5 font-mono text-[11px] text-muted">
          <span className="flex items-center gap-3">
            <span>Arrows to move</span>
            <span className="max-sm:hidden">Enter to run</span>
          </span>
          <span className="text-accent">Omnivra</span>
        </div>
      </div>
    </Command.Dialog>
  );
}
