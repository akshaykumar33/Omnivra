# AI Architecture & Provider Gateway

Omnivra abstracts AI providers behind a unified, vendor-neutral gateway.

```mermaid
graph LR
    NLPrompt["Natural Language Prompt"] --> Gateway["AI Gateway"]
    Gateway --> Ollama["Ollama (Local)"]
    Gateway --> Gemini["Google Gemini"]
    Gateway --> Claude["Anthropic Claude"]
    Gateway --> OpenAI["OpenAI GPT-4o"]

    Gateway --> Validator["Zod Schema Validator"]
    Validator --> StructuredRule["Verified Rule Specification"]
```

## Invariant: Safe Rule Generation

The AI engine NEVER directly invokes system calls. It only yields verified JSON rule declarations conforming to the `RuleSchema` specification.
