# Specification: Eye Tracking Specification

## 1. Problem Statement

Webcam-based eye tracking suffers from gaze drift and varying monitor configurations.

## 2. Goals & Non-Goals

- **Goals**: Provide MediaPipe Iris landmark tracking with 9-point polynomial calibration matrix.
- **Non-Goals**: Does not implement premature application logic or bypass permission safeguards.

## 3. User Experience

- Transparent, low-latency execution (< 120ms).
- Visual feedback via ambient HUD indicator.

## 4. Technical Architecture & API Contracts

```typescript
export interface EyeEngine extends InputEngine {
  calibrate(points: CalibrationTarget[]): Promise<CalibrationMatrix>;
  getGazeCoordinates(): ScreenPoint;
}
```

## 5. Security & Privacy

- Local-first execution boundary.
- Capability grants checked prior to execution.

## 6. Performance Budgets

- Maximum execution latency: ≤ 15ms.
- Zero memory leaks across 24h continuous operation.

## 7. Acceptance Criteria

- 100% unit test coverage of public interfaces.
- Validated against schema specification.
