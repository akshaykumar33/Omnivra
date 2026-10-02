# Security Policy — Omnivra

Omnivra interfaces directly with cameras, microphones, operating-system inputs, browsers, and IDE environments. Security and user privacy are foundational requirements.

---

## 1. Supported Versions

| Version       | Supported          |
| ------------- | ------------------ |
| 0.1.x (Alpha) | :white_check_mark: |
| < 0.1.0       | :x:                |

---

## 2. Security Boundaries & Invariants

1. **Local-First Processing**: MediaPipe and computer vision models process raw video in local memory. Raw video streams are never transmitted over external networks.
2. **Explicit User Consent**: Microphone and camera feeds require persistent visual indicators and explicit user permission grants.
3. **Capability Sandboxing**: Plugins execute in isolated sandboxes and cannot trigger operating system or browser actions without declared, user-granted capabilities.
4. **AI Safety Valve**: AI-generated rules must undergo schema validation and explicit user confirmation before executing privileged system actions.

---

## 3. Reporting a Vulnerability

If you discover a security vulnerability, please do **NOT** open a public issue.

Report vulnerabilities via email to:
**security@omnivra.dev**

Please include:

- Detailed description of the vulnerability.
- Steps to reproduce or proof-of-concept exploit.
- Impact assessment across supported surfaces.

We acknowledge reports within **48 hours** and provide regular progress updates through remediation and public advisory release.
