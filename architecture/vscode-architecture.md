# VS Code Extension Architecture

Integrates multimodal input directly into IDE navigation, editing, and debugging workflows.

## Key Subsystems
1. **Command Adapter**: Bridges Omnivra actions to `vscode.commands.executeCommand`.
2. **Editor Context Provider**: Feeds active language ID, file path, git branch, and cursor line numbers to the Context Engine.
3. **Webview HUD**: Non-intrusive status bar and floating gesture indicator.
