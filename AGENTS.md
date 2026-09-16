# Omnivra AI Agent Operational Protocol

All AI coding assistants (Cursor, Claude Code, Gemini CLI, Copilot, Codex) working on Omnivra MUST adhere to this canonical instruction protocol.

---

## 1. The Core Invariant
> **ANY INPUT → ANY LOGIC → ANY ACTION**

The core packages must remain host-agnostic. All hardware, browser, and OS bindings must pass through capability-checked adapters.

---

## 2. Order of Mandatory Reading before Generating Code
Before generating or modifying any code in this repository, you must read:
1. This root file (`AGENTS.md`)
2. [System Architecture](architecture/system-architecture.md) & [Component Architecture](architecture/component-architecture.md)
3. Applicable [ADRs](architecture/adr/README.md)
4. Current phase document in [phases/](phases/README.md)
5. Current milestone in [milestones/](milestones/README.md)
6. Relevant specification in [specs/](specs/README.md)
7. Applicable skill in [skills/](skills/README.md)

---

## 3. Anti-AI-Slop Rules
* Never generate placeholder or stub files without real implementation.
* Never use `any` or suppress TypeScript diagnostics.
* Never bypass permission checks.
* Never stream raw webcam or microphone data outside the local process.
* Always write unit tests for every logical branch.
