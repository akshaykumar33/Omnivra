# System Architecture

Omnivra follows Clean Architecture and Domain-Driven Design (DDD) to preserve host portability.

```mermaid
graph TD
    subgraph CoreDomain ["Enterprise Domain Layer (@omnivra/types)"]
        Entities["Rule, Trigger, Action, Event, DeviceProfile, Permission"]
    end

    subgraph ApplicationLayer ["Application Layer (@omnivra/core, @omnivra/rule-engine)"]
        UseCases["EvaluateRuleUseCase, RegisterPluginUseCase, DispatchActionUseCase"]
        Ports["InputPort, OutputPort, StoragePort, AIModelPort"]
    end

    subgraph InfrastructureLayer ["Infrastructure Adapters"]
        StorageAdapter["IndexedDB / SQLite Storage Adapter"]
        AIAdapter["Multi-Provider AI Gateway (Ollama, Gemini, Claude)"]
        EventBusAdapter["Typed RxJS / NanoEvents Bus"]
    end

    subgraph HostAdapters ["Host Presentation & Execution Adapters"]
        BrowserAdapter["WebExtension Chrome/Firefox Adapter"]
        VSCodeAdapter["VS Code API Bridge"]
        DesktopAdapter["Tauri IPC & Native Messaging Bridge"]
    end

    Entities --> UseCases
    UseCases --> Ports
    StorageAdapter --> Ports
    AIAdapter --> Ports
    EventBusAdapter --> Ports
    HostAdapters --> Ports
```

## Architectural Invariants

- The domain core has zero external framework dependencies.
- All input modalities communicate through normalized `InputEvent` structures.
- Handlers never directly invoke external APIs; all external interactions pass through capability-checked `HostAdapter` instances.
