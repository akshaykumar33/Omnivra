# Omnivra Threat Model (STRIDE)

| Threat                 | Description                                      | Countermeasure                                                |
| ---------------------- | ------------------------------------------------ | ------------------------------------------------------------- |
| Spoofing               | Forged event injection from untrusted web page   | Content scripts communicate via signed internal message ports |
| Tampering              | Malicious modification of stored rule predicates | Checksum verification on local SQLite/IndexedDB records       |
| Repudiation            | Unaccounted action execution                     | Audit trail logged in local circular telemetry ring           |
| Information Disclosure | Leaking camera feed to cloud                     | Zero cloud transmission of frames; local memory isolation     |
| Denial of Service      | Rapid-fire gesture loop freezing system          | Priority throttling and sliding-window event deduplication    |
| Elevation of Privilege | Plugin executing OS command without consent      | Strict capability validation on every dispatch                |
