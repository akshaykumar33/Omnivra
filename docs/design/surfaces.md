# Multi-Surface Design System

Omnivra operates across 5 distinct surfaces:

1. **Browser Extension Popup**: 380px x 520px compact status view.
2. **Browser Side Panel**: 400px fixed width docked workflow manager.
3. **VS Code Webview**: High-density panel matching VS Code native theme tokens.
4. **Desktop HUD (Tauri)**: Floating translucent pill widget (<40px height).
5. **Dashboard Web App**: Full-page responsive management console.
6. **Marketing Website**: Full-width responsive landing surface, dark-locked with
   a light counterpart via `prefers-color-scheme`.

---

## Why the website diverges from the in-product scale

The type and motion specs in [typography.md](typography.md) and
[motion.md](motion.md) describe **in-product** surfaces: a 380px popup and a
VS Code panel need a 32px display step, a 14px body and sub-180ms transitions,
because they are dense tools the user looks at all day.

A marketing page is read once, at arm's length, on a 1400px canvas. Applying the
in-product scale there produces a page that looks like a settings dialog. So the
website surface:

- scales display type up to a fluid `2.75rem` to `4.25rem`, and body to 15.5px
- keeps the brand easing curve `cubic-bezier(0.16, 1, 0.3, 1)` unchanged
- extends durations to 280-650ms for entry and scroll reveals, since these are
  narrative transitions rather than interface feedback

Everything else is shared: the same tokens from
[design-tokens.md](design-tokens.md), one locked accent, one radius system, and
the same reduced-motion and high-contrast requirements.

### Photography

Omnivra has no product photography yet. Until it does, the website uses
desaturated placeholder imagery behind a scrim so it reads as texture rather
than as a literal claim about the product. Placeholder seeds are stable but the
subject matter is arbitrary, which is exactly why no image is allowed to carry
meaning on its own.

### Honesty labels

Every capability shown on the website carries its real status (Planned,
Experimental, Alpha, Stable) per the README. At the time of writing only the
voice path is Alpha and the rest are Planned, and the page says so.
