# Secret Management

> **A committed secret is compromised.** Not "at risk" — compromised. Remotes are
> replicated, forked, cached, mirrored, and indexed. Deleting the commit does not
> un-leak the value. **Rotation is the fix; history cleanup is tidying up afterwards.**

Omnivra handles AI provider keys, cloud credentials, extension signing keys, desktop
updater keys, and — uniquely — camera and microphone data. The blast radius of a leak
here is larger than for a typical web app.

---

## 1. Rules

**Secrets live in the environment or a secret manager.** Never in source, never in
committed config, never as a default value, never in a test fixture, never in a log
line, never in an error message, never in a comment, never in a Mermaid diagram,
never in a doc example.

Use obvious placeholders everywhere a value would otherwise appear:

```
OPENAI_API_KEY=sk-REPLACE_ME
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/omnivra
```

The scanner recognises `REPLACE_ME`, `CHANGE_ME`, `YOUR_*`, `EXAMPLE`, `PLACEHOLDER`,
`DUMMY`, `SAMPLE`, `REDACTED`, `${VAR}`, `{{var}}`, `<angle-brackets>`,
`process.env.*`, and `import.meta.env.*` as intentional non-secrets.

Prefer `<angle-brackets>` for every part of a connection string rather than only
the password. A `user:REPLACE_ME@host` shape still reads as live credentials to
third-party scanners that do not share our placeholder list, and an alert nobody
can action is an alert people learn to ignore.

### `.env.example` is the contract

Every key Omnivra reads appears in [`.env.example`](../../.env.example) with an empty
or placeholder value. A new contributor should be able to see what the app needs
without guessing or asking. Real `.env` files are git-ignored _and_ refused by the
protection gate.

### Logging

The `@omnivra/logger` package is the single sink. Redaction belongs **at the sink**,
keyed on field name — `token`, `key`, `secret`, `password`, `authorization`, `cookie`,
`apiKey`, `refresh_token` — so that a careless call site cannot leak. This is why
`console.*` is blocked in shipped source: output that bypasses the sink bypasses
redaction.

> **Current gap:** `packages/logger` does not implement redaction yet — it is a thin
> console wrapper. Tracked as part of M06 (Logging). Until it lands, treat every
> logged object as if it will be read by someone else.

### Telemetry

Payloads are **allow-listed by field**, never denied by field. Never send raw user
input, page content, file paths, camera frames, or audio. See
[privacy.md](privacy.md).

### CI

Secrets come from GitHub Actions secrets or OIDC. Never echo them. Never expose them
to workflows triggered by `pull_request` from forks. Publishing credentials live in
the protected `release` environment, which PR workflows cannot reach.

Pass untrusted input — PR titles, branch names, issue bodies — through `env:`, never
inlined into a shell command where it becomes injection.

---

## 2. Defence layers

| Layer                    | What it catches                                                       | Skippable?    |
| ------------------------ | --------------------------------------------------------------------- | ------------- |
| `.gitignore`             | Known-bad paths before `git add`                                      | —             |
| `pre-commit`             | Credential files and secret content in the staged diff                | `--no-verify` |
| `pre-push`               | Secrets in **any** commit on the branch, including ones later removed | `--no-verify` |
| Protection Gate workflow | Everything above, on every PR                                         | No            |
| Gitleaks workflow        | Independent ruleset, second opinion                                   | No            |
| Weekly full-history scan | Drift and late-discovered patterns                                    | No            |
| GitHub push protection   | Known provider token formats, server-side on receive                  | No            |

Two scanners with different rule sets miss less than either alone, which is why both
`scripts/scan-secrets.mjs` and gitleaks run.

See [../development/commit-hooks.md](../development/commit-hooks.md) for the full
mechanics.

---

## 3. What the scanner detects

Vendor-specific, high-confidence formats: PEM/OpenSSH/PGP private key blocks, AWS
access keys, OpenAI / Anthropic / Gemini / OpenRouter keys, GitHub tokens (classic and
fine-grained), npm tokens, Slack tokens and webhooks, Stripe keys, GCP service-account
material, Tauri updater keys, JWTs, database and broker URLs with inline credentials,
and `.npmrc` auth tokens.

Plus one deliberately-last generic rule: a secret-shaped, high-entropy value assigned
to a credential-named key.

Path shapes are checked separately, because an encrypted `.p12` has no greppable
secret in it but is still a credential.

### Tuning

A noisy gate is a gate people learn to bypass, so false positives are treated as bugs.
If you hit one:

1. Prefer fixing the rule in `scripts/lib/secret-rules.mjs`.
2. Add a case to `scripts/selftest-protection.mjs` so it stays fixed.
3. Only if the line genuinely must contain secret-shaped text, annotate it:

```ts
const decoyToken = "AKIA..."; // secret-scan:allow — fixture for the scanner's own tests
```

and explain it in the PR description.

---

## 4. If a secret is committed

Work in this order. **Do not start with git history.**

### 1. Rotate — immediately

Revoke the credential at the provider and issue a replacement. This is the only step
that actually closes the exposure. Everything after it is cleanup.

| Credential        | Where to revoke                                   |
| ----------------- | ------------------------------------------------- |
| OpenAI            | platform.openai.com → API keys                    |
| Anthropic         | console.anthropic.com → API keys                  |
| Google / Gemini   | Google Cloud console → Credentials                |
| OpenRouter        | openrouter.ai/keys                                |
| AWS               | IAM → deactivate, then delete the access key      |
| GitHub PAT        | Developer settings → Tokens                       |
| npm               | `npm token revoke <id>`                           |
| Tauri updater     | Generate a new key pair; re-sign pending releases |
| Store credentials | Regenerate in the respective developer console    |

### 2. Assess

Check provider audit logs, CloudTrail, or GitHub audit logs for use between commit and
revocation. Assume the key was scraped within minutes — public GitHub is scanned
continuously by people who are not you.

### 3. Clean history

Only after rotation:

```bash
# Preferred: git-filter-repo
git filter-repo --path path/to/leaked-file --invert-paths

# Coordinate first — this rewrites history for everyone
git push --force-with-lease --all
git push --force-with-lease --tags
```

Every collaborator must re-clone or hard-reset. Open a GitHub support request to purge
cached views if the repository is public.

### 4. Record it

Add a dated entry under `docs/security/incidents/` covering what leaked, how long it
was exposed, what was rotated, what the logs showed, and which gate layer should have
caught it. Then fix that layer.

**No blame.** The gate failing is a system problem. People commit secrets by accident;
that is precisely the assumption the gate is built on.

---

## 5. Camera, microphone & user data

Omnivra-specific, and just as serious as credentials:

- **Never commit captured media.** The gate blocks `*.mp4`, `*.mov`, `*.webm`, `*.wav`,
  `*.mp3`, and friends outside `docs/assets/` and `fixtures/`.
- **Test fixtures are synthetic.** Generate them; do not record a real person.
- **Never commit production data or database dumps.** Use a seed script.
- Raw camera and microphone frames never leave the local process — see
  [threat-model.md](threat-model.md) and [privacy.md](privacy.md).

---

## 6. Reporting

Do not open a public issue for a vulnerability or a live leak. Follow
[SECURITY.md](../../SECURITY.md).
