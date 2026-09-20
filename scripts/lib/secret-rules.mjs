/**
 * Secret detection rules for the Omnivra protection gate.
 *
 * Design notes:
 *  - Prefer high-confidence, vendor-specific token shapes. They are cheap and
 *    almost never produce false positives.
 *  - The single generic `assigned-secret` rule is deliberately last and is
 *    filtered aggressively through PLACEHOLDER_VALUE, because a noisy gate that
 *    contributors learn to bypass is worse than a narrower gate they trust.
 *  - Every rule carries remediation context: a finding should tell you what was
 *    found and what to rotate, not just that a regex matched.
 */

/** Values that look like a secret's shape but are obviously not real. */
export const PLACEHOLDER_VALUE =
  /^(?:x{3,}|\*{3,}|\.{3,}|-+|<[^>]*>|\$\{[^}]*\}|\{\{[^}]*\}\}|%[A-Z_]+%|process\.env\.[A-Za-z0-9_.]+|import\.meta\.env\.[A-Za-z0-9_.]+|null|undefined|true|false|none|empty|unset)$/i;

/** Substrings that mark a value as an intentional placeholder anywhere within it. */
export const PLACEHOLDER_MARKERS = [
  'replace_me',
  'replaceme',
  'change_me',
  'changeme',
  'your_',
  'your-',
  'yourkey',
  'example',
  'placeholder',
  'dummy',
  'sample',
  'redacted',
  'xxxxx',
  'insert_',
  'fake_',
  'not_a_real',
  'notarealsecret',
  'test_only',
  'testonly',
];

/** Inline escape hatch, e.g. `const decoyToken = '…'; // secret-scan:allow documented fixture` */
export const INLINE_ALLOW = /(?:secret-scan:allow|gitleaks:allow)/i;

/**
 * Paths excluded from scanning. These either legitimately contain secret-shaped
 * text (the rules themselves, the docs describing them) or are machine-generated.
 */
export const EXCLUDED_PATHS = [
  /^scripts\/lib\/secret-rules\.mjs$/,
  /^scripts\/scan-secrets\.mjs$/,
  /^scripts\/selftest-protection\.mjs$/,
  /^\.gitleaks\.toml$/,
  /^docs\/security\/secret-management\.md$/,
  /^prompts\/starter_prompt\.md$/,
  /(^|\/)pnpm-lock\.yaml$/,
  /(^|\/)package-lock\.json$/,
  /(^|\/)yarn\.lock$/,
  /(^|\/)Cargo\.lock$/,
  /(^|\/)CHANGELOG\.md$/,
  /(^|\/)node_modules\//,
  /(^|\/)dist\//,
  /(^|\/)build\//,
  /(^|\/)coverage\//,
  /(^|\/)\.turbo\//,
];

export function isExcludedPath(file) {
  const normalized = file.replace(/\\/g, '/');
  return EXCLUDED_PATHS.some((pattern) => pattern.test(normalized));
}

/**
 * True when a captured value is clearly not a live credential.
 * Applied to the *value* portion of a match, never the whole line.
 */
export function isPlaceholder(value) {
  if (!value) return true;
  const trimmed = value.trim().replace(/^['"`]|['"`]$/g, '');
  if (trimmed.length === 0) return true;
  if (PLACEHOLDER_VALUE.test(trimmed)) return true;

  const lower = trimmed.toLowerCase();
  if (PLACEHOLDER_MARKERS.some((marker) => lower.includes(marker))) return true;

  // A value made of a single repeated character carries no entropy.
  if (/^(.)\1+$/.test(trimmed)) return true;

  return false;
}

/**
 * Shannon entropy in bits/char. Used only to suppress low-entropy matches of
 * the generic rule — vendor-specific rules do not need it.
 */
export function entropy(value) {
  if (!value) return 0;
  const counts = new Map();
  for (const char of value) counts.set(char, (counts.get(char) ?? 0) + 1);
  let bits = 0;
  for (const count of counts.values()) {
    const p = count / value.length;
    bits -= p * Math.log2(p);
  }
  return bits;
}

/**
 * Rules are evaluated in order. `capture` selects which regex group holds the
 * value to placeholder-test; default 0 (the whole match).
 */
export const RULES = [
  {
    id: 'private-key-block',
    description: 'PEM/OpenSSH/PGP private key block',
    rotate: 'Revoke the key pair and reissue. Treat anything it signed as suspect.',
    pattern:
      /-----BEGIN (?:RSA |DSA |EC |OPENSSH |PGP |ENCRYPTED |SSH2 )?PRIVATE KEY(?: BLOCK)?-----/g,
    allowPlaceholder: false,
  },
  {
    id: 'aws-access-key-id',
    description: 'AWS access key ID',
    rotate: 'Deactivate the key in IAM, then delete it. Review CloudTrail for use.',
    pattern: /\b(?:AKIA|ASIA|ABIA|ACCA|AIDA|AROA|AIPA|ANPA|ANVA)[A-Z0-9]{16}\b/g,
  },
  {
    id: 'aws-secret-access-key',
    description: 'AWS secret access key (contextual)',
    rotate: 'Deactivate the associated access key in IAM immediately.',
    pattern:
      /\baws_?secret_?access_?key\b[^\n]{0,20}?['"]([A-Za-z0-9/+=]{40})['"]/gi,
    capture: 1,
  },
  {
    id: 'openai-api-key',
    description: 'OpenAI API key',
    rotate: 'Revoke at platform.openai.com/api-keys and issue a replacement.',
    pattern: /\bsk-(?:proj-|svcacct-|admin-)?[A-Za-z0-9_-]{32,}\b/g,
  },
  {
    id: 'anthropic-api-key',
    description: 'Anthropic API key',
    rotate: 'Revoke in the Anthropic console and issue a replacement.',
    pattern: /\bsk-ant-(?:api\d{2}|admin\d{2})-[A-Za-z0-9_-]{24,}\b/g,
  },
  {
    id: 'google-api-key',
    description: 'Google / Gemini API key',
    rotate: 'Delete the key in Google Cloud console; check for API key restrictions.',
    pattern: /\bAIza[0-9A-Za-z_-]{35}\b/g,
  },
  {
    id: 'openrouter-api-key',
    description: 'OpenRouter API key',
    rotate: 'Revoke at openrouter.ai/keys.',
    pattern: /\bsk-or-v1-[a-f0-9]{48,}\b/g,
  },
  {
    id: 'github-token',
    description: 'GitHub personal access / app token',
    rotate: 'Revoke in GitHub developer settings; audit repo and org audit logs.',
    pattern: /\bgh[pousr]_[A-Za-z0-9]{36,}\b/g,
  },
  {
    id: 'github-fine-grained-pat',
    description: 'GitHub fine-grained personal access token',
    rotate: 'Revoke in GitHub developer settings.',
    pattern: /\bgithub_pat_[A-Za-z0-9_]{60,}\b/g,
  },
  {
    id: 'npm-token',
    description: 'npm access token',
    rotate: 'Revoke with `npm token revoke`; rotate any publish automation.',
    pattern: /\bnpm_[A-Za-z0-9]{36}\b/g,
  },
  {
    id: 'slack-token',
    description: 'Slack token',
    rotate: 'Revoke the token and reinstall the app if it was a bot token.',
    pattern: /\bxox[abprs]-[A-Za-z0-9-]{10,}\b/g,
  },
  {
    id: 'slack-webhook',
    description: 'Slack incoming webhook URL',
    rotate: 'Delete the webhook in the Slack app configuration.',
    pattern: /https:\/\/hooks\.slack\.com\/services\/T[A-Za-z0-9_/-]{20,}/g,
  },
  {
    id: 'stripe-secret-key',
    description: 'Stripe secret key',
    rotate: 'Roll the key in the Stripe dashboard immediately.',
    pattern: /\bsk_(?:live|test)_[A-Za-z0-9]{20,}\b/g,
  },
  {
    id: 'gcp-service-account',
    description: 'Google Cloud service-account key material',
    rotate: 'Delete the service-account key in IAM and issue a new one.',
    pattern: /"type"\s*:\s*"service_account"/g,
  },
  {
    id: 'tauri-updater-key',
    description: 'Tauri updater / minisign private key',
    rotate: 'Generate a new updater key pair and re-sign pending releases.',
    pattern: /dW50cnVzdGVkIGNvbW1lbnQ6[A-Za-z0-9+/=]{10,}/g,
  },
  {
    id: 'jwt',
    description: 'JSON Web Token',
    rotate: 'Rotate the signing secret; the token itself may encode live claims.',
    pattern: /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g,
  },
  {
    id: 'connection-string-credentials',
    description: 'Database or broker URL with inline credentials',
    rotate: 'Rotate the database role password and update the secret store.',
    pattern:
      /\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis(?:s)?|amqps?|mssql):\/\/[^\s:@/'"]+:([^\s:@/'"]{3,})@/gi,
    capture: 1,
  },
  {
    id: 'npmrc-auth-token',
    description: 'Registry auth token in .npmrc form',
    rotate: 'Revoke the npm token and regenerate CI credentials.',
    pattern: /_authToken\s*=\s*([^\s#]{8,})/g,
    capture: 1,
  },
  {
    id: 'basic-auth-header',
    description: 'Hard-coded HTTP Basic/Bearer authorization header',
    rotate: 'Rotate the underlying credential.',
    pattern:
      /\bauthorization\b\s*[:=]\s*['"`](?:basic|bearer)\s+([A-Za-z0-9+/_.=-]{16,})['"`]/gi,
    capture: 1,
  },
  {
    id: 'assigned-secret',
    description: 'Secret-shaped value assigned to a credential-named key',
    rotate: 'Rotate the credential, then move it to the environment or secret store.',
    pattern:
      /\b(?:api[_-]?key|apikey|secret[_-]?key|client[_-]?secret|auth[_-]?token|access[_-]?token|refresh[_-]?token|private[_-]?key|password|passwd|pwd|credential|signing[_-]?key|encryption[_-]?key)\b\s*[:=]\s*['"`]([^'"`\n]{8,})['"`]/gi,
    capture: 1,
    minEntropy: 2.6,
  },
];
