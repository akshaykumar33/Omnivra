# Runtime Architecture & Lifecycle

Omnivra components operate across multi-tier processes:

- **UI Process**: High-fidelity React rendering, 60fps animations.
- **Worker Process**: MediaPipe landmarks, audio FFT, model execution.
- **Service Worker / Background Daemon**: State coordination and action dispatch.
