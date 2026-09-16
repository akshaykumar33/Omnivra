# Omnivra Technical Specifications Directory

Every core subsystem, recognition engine, host adapter, and integration contract is formally specified before implementation.

| Domain | Specification | Scope |
| ------ | ------------- | ----- |
| Core Kernel | [core/spec.md](core/spec.md) | Central orchestration, lifecycle, and adapter registries |
| Event Bus | [event-bus/spec.md](event-bus/spec.md) | Typed pub/sub, priority queues, backpressure handling |
| Rule Engine | [rules/spec.md](rules/spec.md) | Evaluator, compound condition resolution, debounce |
| Action Engine | [actions/spec.md](actions/spec.md) | Permission gates, dispatch router, execution rollback |
| Plugin SDK | [plugins/spec.md](plugins/spec.md) | Plugin manifest format, capability sandbox, lifecycle |
| Browser Host | [browser/spec.md](browser/spec.md) | WebExtension MV3, tab controls, DOM script bridge |
| VS Code Host | [vscode/spec.md](vscode/spec.md) | Editor commands, cursor navigation, window focus |
| Desktop Host | [desktop/spec.md](desktop/spec.md) | Tauri v2, native messaging, global OS shortcuts |
| Voice Engine | [voice/spec.md](voice/spec.md) | Speech recognition, wake words, intent extraction |
| Gesture Engine | [gesture/spec.md](gesture/spec.md) | MediaPipe hands, landmark normalization, gestures |
| Eye Engine | [eye/spec.md](eye/spec.md) | Iris tracking, screen coordinate mapping, calibration |
| Face Engine | [face/spec.md](face/spec.md) | Facial landmark mesh, blink detection, head tilt |
| AI Engine | [ai/spec.md](ai/spec.md) | Provider gateway, NL intent compiler, schema validation |
| Cloud Relay | [cloud/spec.md](cloud/spec.md) | Zero-knowledge WebSocket relay, presence, sync |
| Sync Engine | [sync/spec.md](sync/spec.md) | Client-side E2EE, CRDT rule merge, conflict resolution |
