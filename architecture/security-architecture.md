# Security Architecture & Capability Model

Omnivra adheres to the Principle of Least Privilege and Zero Trust across all execution hosts.

## Threat Model

| Threat | Risk Level | Mitigation Strategy |
| ------ | ---------- | ------------------- |
| Malicious Plugin code execution | Critical | Sandbox isolation, static AST audit, explicit capability manifests. |
| Unauthorized camera/mic snooping | Critical | Local-only processing, hardware indicator alerts, OS permission checks. |
| Injected AI prompt executing bad commands | High | Structured schema validation, mandatory human approval for sensitive actions. |
| Native messaging exploit (Desktop) | High | Origin verification, strict JSON-RPC schema validation, process non-elevation. |

## Capability-Based Permissions

Actions require explicit grants in `omnivra.config.json`:
* `media:playback.toggle`: Low risk (Granted by default).
* `browser:tab.switch`: Low risk.
* `browser:dom.interact`: Medium risk (Requires domain whitelist).
* `os:clipboard.read`: High risk (Explicit prompt required).
* `os:process.execute`: Critical risk (User confirmation modal on every invocation).
