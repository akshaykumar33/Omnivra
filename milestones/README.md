# Omnivra 40-Milestone Execution Matrix (M00 — M39)

Every phase is decomposed into discrete, testable milestones.

| Milestone | Title | Phase | Deliverables |
| --------- | ----- | ----- | ------------ |
| M00 | Project Discovery | Phase 00 | Vision document, personas, use cases |
| M01 | Architecture Blueprint | Phase 01 | C4 diagrams, subsystem topologies, ADR index |
| M02 | Monorepo Setup | Phase 01 | pnpm, Turborepo, Changesets, TypeScript config |
| M03 | Shared Domain Types | Phase 02 | @omnivra/types package, event envelope interfaces |
| M04 | Logger & Utilities | Phase 02 | @omnivra/logger, @omnivra/utils |
| M05 | Configuration Engine | Phase 02 | @omnivra/config, schema validator |
| M06 | Event Bus Implementation | Phase 02 | @omnivra/event-bus with priority queues |
| M07 | Storage & Persistence | Phase 02 | Local storage adapters (IndexedDB, SQLite) |
| M08 | Rule Engine Kernel | Phase 03 | @omnivra/rule-engine, predicate evaluator |
| M09 | Action Engine Dispatcher | Phase 03 | @omnivra/action-engine, permission checks |
| M10 | Browser Shell (WXT) | Phase 04 | apps/browser-extension scaffolding, MV3 worker |
| M11 | Browser Host Adapter | Phase 04 | Tab navigation, scroll, and media bridge |
| M12 | Voice Engine (WebSpeech) | Phase 05 | Browser speech recognition and intent matching |
| M13 | Voice Engine (Whisper) | Phase 05 | Local quantized model integration |
| M14 | Gesture Engine Pipeline | Phase 06 | MediaPipe worker thread integration |
| M15 | Hand Gesture Classifiers | Phase 06 | Pinch, palm, swipe, peace sign detectors |
| M16 | Eye Tracking Engine | Phase 07 | Iris coordinate extraction |
| M17 | 9-Point Eye Calibration | Phase 07 | Polynomial screen coordinate mapping |
| M18 | Facial Expression Engine | Phase 07 | Micro-blink detection, brow movement |
| M19 | VS Code Shell | Phase 08 | apps/vscode-extension scaffolding |
| M20 | VS Code Host Adapter | Phase 08 | Editor commands, cursor moves, split navigation |
| M21 | AI Provider Abstraction | Phase 09 | Provider gateway (Ollama, Gemini, Claude) |
| M22 | AI Natural Language Compiler | Phase 09 | Conversational intent to Zod rule converter |
| M23 | Plugin SDK Kernel | Phase 10 | @omnivra/plugin-sdk definition, sandbox runtime |
| M24 | Official YouTube Plugin | Phase 10 | plugins/youtube implementation |
| M25 | Official GitHub Plugin | Phase 10 | plugins/github implementation |
| M26 | Official Spotify Plugin | Phase 10 | plugins/spotify implementation |
| M27 | CLI Tooling | Phase 10 | @omnivra/cli for plugin scaffolding |
| M28 | Desktop Shell (Tauri v2) | Phase 11 | apps/desktop scaffolding, Rust backend |
| M29 | Native Messaging Bridge | Phase 11 | JSON-RPC bridge between browser/IDE and OS |
| M30 | UI Design System | Phase 11 | @omnivra/ui component library, tokens |
| M31 | Dashboard Web App | Phase 11 | apps/dashboard rule builder and telemetry |
| M32 | Cloud Sync Relay Server | Phase 12 | Zero-knowledge WebSocket relay service |
| M33 | E2EE CRDT Sync Engine | Phase 12 | Client-side rule encryption and merge |
| M34 | Plugin Marketplace Portal | Phase 13 | Registry API and signature verification |
| M35 | Security Hardening | Phase 14 | Pen testing, sandbox audit, permission checks |
| M36 | Performance Optimization | Phase 14 | 60fps HUD, <25ms inference, zero memory leaks |
| M37 | Accessibility Audit | Phase 14 | WCAG 2.2 AA verification, screen-reader testing |
| M38 | Cross-Browser Packaging | Phase 15 | Chrome, Firefox, Edge distribution packages |
| M39 | v1.0 General Availability | Phase 15 | Release launch, documentation portal |
