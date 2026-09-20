# System Context & Boundaries

Describes the external actors, devices, hardware peripherals, and target applications that interact with Omnivra.

```mermaid
C4Context
    title System Context diagram for Omnivra

    Person(user, "User / Developer", "Interacts via multimodal gestures, voice, gaze, or hotkeys")

    System(omnivra, "Omnivra Platform", "Multimodal HCI routing engine and host adapters")

    System_Ext(hardware, "Peripherals", "Webcam, Microphone, Keyboard, Eye Trackers")
    System_Ext(browser, "Web Browsers", "Chrome, Edge, Firefox, Brave via WebExtension APIs")
    System_Ext(ide, "Code Editors", "VS Code, Cursor via Extension Host")
    System_Ext(os, "Operating System", "Windows, macOS, Linux desktop environments via Tauri v2")
    System_Ext(ai_providers, "AI Providers", "Ollama, OpenAI, Anthropic, Gemini (Intent resolution only)")

    Rel(hardware, omnivra, "Raw media streams (Frames, Audio buffers)")
    Rel(user, omnivra, "Configures rules, triggers actions, gives consent")
    Rel(omnivra, browser, "Executes DOM actions, tab switches, media control")
    Rel(omnivra, ide, "Executes editor commands, navigation, refactoring")
    Rel(omnivra, os, "Executes window focus, media keys, shortcuts")
    Rel(omnivra, ai_providers, "Sends natural language for structured rule drafting")
```

## Process & Trust Boundaries

1. **Device Sensor Boundary**: Microphone and camera feeds reside strictly in high-isolation worker threads.
2. **Plugin Sandbox Boundary**: External plugins run within an isolated context with restricted globals.
3. **Network Boundary**: Zero telemetry or rule data leaves the machine unless cloud sync is explicitly enabled with end-to-end encryption.
