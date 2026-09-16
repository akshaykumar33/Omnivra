# Dependency Graph & Package Boundary Rules

1. `@omnivra/types` may NOT import from any internal package.
2. `@omnivra/core` may only depend on `@omnivra/types`, `@omnivra/utils`, and `@omnivra/logger`.
3. Recognition engines must communicate via standard `InputEvent` payloads. Circular dependencies are enforced as CI build errors.
