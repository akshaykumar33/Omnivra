# Git Workflow & Conventional Commits

We follow trunk-based development with short-lived feature branches:
```
main (Protected, stable)
  └── feat/voice-engine-whisper
  └── fix/browser-tab-navigation
```

## Commit Format
All commits must follow Conventional Commits:
```
feat(core): implement event bus priority queue
fix(browser): resolve tab switch race condition
docs(architecture): update multimodal pipeline diagram
```
