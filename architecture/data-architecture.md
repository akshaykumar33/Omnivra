# Data Architecture & Storage Strategy

Omnivra stores configuration, rules, calibration profiles, and telemetry locally.

```mermaid
erDiagram
    RULE ||--o{ TRIGGER : contains
    RULE ||--o{ CONDITION : evaluates
    RULE ||--o{ ACTION : dispatches
    DEVICE_PROFILE ||--o{ CALIBRATION : contains
    PLUGIN ||--o{ CAPABILITY : requests

    RULE {
        string id PK
        string name
        boolean enabled
        int priority
        datetime createdAt
        datetime updatedAt
    }

    TRIGGER {
        string id PK
        string ruleId FK
        string type
        json parameters
    }

    CONDITION {
        string id PK
        string ruleId FK
        string hostPattern
        json predicate
    }

    ACTION {
        string id PK
        string ruleId FK
        string actionType
        json payload
    }
```

## Storage Engines

- **Browser Extension**: `chrome.storage.local` for configuration; IndexedDB for offline model weights and cached rules.
- **VS Code / Desktop**: SQLite (via `better-sqlite3` / Tauri SQL) for rapid rule lookups and persistent profile vectors.
