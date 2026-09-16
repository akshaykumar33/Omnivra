# Omnivra Governance Model

Omnivra operates under a meritocratic, transparent open-source governance framework designed for long-term platform stability, security, and developer ecosystem health.

---

## 1. Roles & Responsibilities

### Contributors
Anyone who submits code, documentation, specifications, or community feedback. Contributors adhere to the Code of Conduct and contribution standards.

### Maintainers
Active contributors with write access to the repository. Maintainers:
* Review and merge Pull Requests.
* Maintain CI/CD pipelines, release artifacts, and dependencies.
* Triage bugs, vulnerabilities, and architectural proposals.

### Steering Committee
The core architectural leadership responsible for:
* Final approval of Architectural Decision Records (ADRs).
* Setting milestone priorities and release roadmaps.
* Security incident management and permission boundary governance.

---

## 2. Decision Making & RFC Process

* Any breaking change, new engine modality, or major architectural shift requires an **Architectural Decision Record (ADR)** in `architecture/adr/`.
* Decisions are discussed in public RFC issues. Approval requires consensus or a majority vote among the Steering Committee.

---

## 3. Conflict Resolution
Disagreements are resolved objectively by evaluating alignment with the core architectural tenets:
1. **User Safety & Privacy First** (No raw audio/video leaks).
2. **Minimal Latency** (Adherence to performance budgets).
3. **Modular Extensibility** (Clean public SDK contracts).
