# Omnivra Documentation Portal

Welcome to the Omnivra engineering and product documentation.

## Sections

- [Product Documentation](product/vision.md) — Vision, PRD, personas, use cases, and feature matrix.
- [Engineering Standards](engineering/engineering-principles.md) — Architecture principles, coding standards, performance budgets.
- [Development Guides](development/local-development.md) — Local setup, testing, and debugging.
- [Security & Privacy](security/threat-model.md) — Threat model, capability boundaries, and privacy invariants.
- [Browser Extension](browser-extension/README.md) — How voice and gesture reach every site, the user guide, permissions, and Web Store submission.

## Delivery Protocol

Every change reaches `main` the same way: **branch → build → verify → secret-scan → commit → PR → green checks → review → merge**.

- [Git Workflow](development/git-workflow.md) — The loop, commit conventions, and one-time setup.
- [Branching](development/branching.md) — Branch model, naming rules, and lifecycle.
- [Protection Gate](development/commit-hooks.md) — What the hooks block before a commit lands, and why.
- [Pull Requests](development/pull-requests.md) — Authoring, reviewing, and the required checklist.
- [Merge Policy](development/merge-policy.md) — Merge requirements and branch-protection settings.
- [Secret Management](security/secret-management.md) — Handling credentials, and what to do after a leak.
- [Design System](design/design-philosophy.md) — Multi-surface design system, semantic tokens, and typography.
- [Accessibility](accessibility/philosophy.md) — WCAG 2.2 AA requirements and assistive workflows.
- [API Reference](api/README.md) — Public contracts and plugin interfaces.
