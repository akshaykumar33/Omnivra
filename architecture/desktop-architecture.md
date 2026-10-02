# Desktop Companion Architecture (Tauri v2)

Provides global system input handling, hardware acceleration, and OS-level application switching.

## Key Subsystems

1. **Rust Core**: Low-overhead global hotkey listeners, native window tracking, and system tray.
2. **Native Messaging Host**: Secure JSON-RPC bridge communicating with Chrome, Firefox, and VS Code.
3. **Hardware Acceleration**: Access to native GPU pipelines (Vulkan/Metal/DirectX) for high-performance computer vision inference.
