# Deployment Architecture

Details build artifact distribution across target ecosystems:

- **NPM Registry**: Shared libraries (`@omnivra/core`, `@omnivra/plugin-sdk`).
- **Extension Marketplaces**: Chrome Web Store, Edge Addons, Firefox AMO, Open VSX, VS Code Marketplace.
- **Desktop Releases**: GitHub Releases (MSI, DMG, AppImage) via automated Changesets & CI.
