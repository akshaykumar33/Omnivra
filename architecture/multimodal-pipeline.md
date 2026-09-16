# Multimodal Pipeline & Recognition Lifecycle

Omnivra processes concurrent visual, audio, and physical signals through a synchronized, low-latency pipeline.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Sensor as Camera / Mic
    participant Worker as Inference Worker (WebWorker / WorkerThread)
    participant Model as MediaPipe / ONNX Runtime
    participant Norm as Normalizer
    participant Bus as Event Bus
    participant Rule as Rule Engine
    participant Action as Action Engine
    participant Target as Target Host (Browser/IDE)

    User->>Sensor: Performs gesture (e.g. Pinch, Palm-Up)
    Sensor->>Worker: Delivers video frame (SharedArrayBuffer)
    Worker->>Model: Execute inference (quantized model)
    Model-->>Worker: Raw landmarks (x, y, z confidence)
    Worker->>Norm: Classify gesture pattern
    Norm->>Bus: Emit typed 'gesture:hand.pinch'
    Bus->>Rule: Match active context & conditions
    Rule->>Action: Resolve action 'editor.goToNextTab'
    Action->>Target: Execute host command via adapter
    Target-->>User: Visual response (< 120ms total latency)
```

## Latency Budgets & Sampling
* **Camera Capture**: 30 FPS input, throttled inference (15-20 FPS) to conserve CPU/battery.
* **Inference Budget**: ≤ 25ms per frame on standard integrated GPUs via WebGL/WebGPU.
* **Event Dispatch & Rule Match**: ≤ 5ms.
* **Action Dispatch**: ≤ 15ms.
* **End-to-End Latency Target**: ≤ 120ms from physical gesture to visual feedback.
