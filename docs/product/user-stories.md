# User Stories & Acceptance Scenarios

## Epic 1: Multimodal Rule Engine
* **US-101**: As a user, I want to create a rule linking a hand gesture to a browser action so that I can control web pages without touching the keyboard.
  * *Acceptance Criteria*: Rule builder UI allows selecting gesture, conditions (e.g. hostname), and action; rule triggers reliably in under 120ms.
* **US-102**: As an assistive user, I want to calibrate eye sensitivity so that gaze cursor tracking matches my screen setup.
  * *Acceptance Criteria*: Interactive 9-point calibration target stores personalized error matrix locally.

## Epic 2: Privacy & Permission Control
* **US-201**: As a security-conscious user, I want clear visual indicators when camera or mic tracking is active.
  * *Acceptance Criteria*: Ambient HUD displays persistent green status indicator during active inference; ceases immediately upon pause.
* **US-202**: As a developer, I want plugins to declare permissions upfront so that I know what capabilities they can access.
  * *Acceptance Criteria*: Extension displays capability review modal before activating third-party plugin.
