# Cloud Sync & Multi-Device Architecture

Omnivra rules and user preference profiles synchronize seamlessly across devices while preserving end-to-end encryption (E2EE).

```mermaid
sequenceDiagram
    autonumber
    participant DevA as Laptop (VS Code / Extension)
    participant E2EE as Client E2EE Layer (WebCrypto AES-GCM)
    participant Relay as Omnivra Sync Relay (WebSocket/Postgres)
    participant DevB as Desktop Companion

    DevA->>DevA: User creates gesture rule
    DevA->>E2EE: Encrypt rule with master passkey
    E2EE->>Relay: Publish encrypted payload + version vector
    Relay->>DevB: Broadcast sync notification
    DevB->>Relay: Fetch encrypted changeset
    DevB->>DevB: Decrypt with local passkey & resolve CRDT conflicts
```

## Invariants

- Sync Relay never receives plaintext rule descriptions or configuration values.
- CRDT-based conflict resolution ensures offline edits merge deterministically.
