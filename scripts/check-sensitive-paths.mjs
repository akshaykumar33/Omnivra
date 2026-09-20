#!/usr/bin/env node
/**
 * Blocks files that must never enter history: credential material, local
 * environment files, captured media, build output, and oversized blobs.
 *
 * Path-shape defence complements content scanning — an encrypted keystore or a
 * binary .p12 has no greppable secret in it, but it is still a credential.
 *
 * Usage: check-sensitive-paths.mjs [--staged | --all]
 */

import {
  stagedFiles,
  stagedSize,
  trackedFiles,
  stagedContent,
} from "./lib/git.mjs";
import { reportFindings } from "./lib/report.mjs";
import { readFileSync, statSync } from "node:fs";

const MAX_FILE_KB = Number.parseInt(
  process.env.OMNIVRA_MAX_FILE_KB ?? "1024",
  10,
);

/** Explicitly permitted paths, checked before the deny rules. */
const ALLOW = [
  /^\.env\.example$/,
  /^\.env\.sample$/,
  /^\.env\.template$/,
  /(^|\/)fixtures\//,
  /(^|\/)__fixtures__\//,
  /(^|\/)testdata\//,
  /^docs\/assets\//,
];

const DENY = [
  {
    id: "env-file",
    test: /(^|\/)\.env(\.[A-Za-z0-9_-]+)*$/,
    message: "Local environment file — these hold real credentials.",
    fix: "Keep it untracked. Add the key names (with empty values) to .env.example instead.",
  },
  {
    id: "private-key-file",
    test: /\.(pem|key|p8|p12|pfx|keystore|jks|ppk|asc|gpg)$/i,
    message: "Private key / keystore material.",
    fix: "Store in a secret manager or CI secret. Never in the repository.",
  },
  {
    id: "ssh-key",
    test: /(^|\/)id_(rsa|dsa|ecdsa|ed25519)(\.\w+)?$/,
    message: "SSH private key.",
    fix: "Remove and rotate the key pair immediately.",
  },
  {
    id: "certificate",
    test: /\.(crt|cer|der|mobileprovision)$/i,
    message: "Certificate or provisioning profile.",
    fix: "If this is a required public test fixture, move it under a fixtures/ directory.",
  },
  {
    id: "cloud-credentials",
    test: /(^|\/)(credentials|service-account[\w.-]*|gcp-[\w.-]*|aws-[\w.-]*|azure-[\w.-]*)\.(json|ya?ml|ini)$/i,
    message: "Cloud provider credential file.",
    fix: "Use workload identity / OIDC in CI instead of a checked-in key file.",
  },
  {
    id: "secrets-file",
    test: /(^|\/)secrets?\.(json|ya?ml|toml|ini|env|txt)$/i,
    message: "File named as a secret store.",
    fix: "Move the values into the environment or a secret manager.",
  },
  {
    id: "aws-config-dir",
    test: /(^|\/)\.aws\//,
    message: "AWS CLI configuration directory.",
    fix: "Never commit ~/.aws. Rotate anything that was inside it.",
  },
  {
    id: "ssh-dir",
    test: /(^|\/)\.ssh\//,
    message: "SSH configuration directory.",
    fix: "Never commit ~/.ssh. Rotate any key that was inside it.",
  },
  {
    id: "captured-media",
    test: /\.(mp4|mov|webm|avi|mkv|wav|mp3|m4a|flac|ogg)$/i,
    message:
      "Audio/video file — may contain real camera or microphone capture.",
    fix: "Omnivra never commits captured media. Use synthetic fixtures under fixtures/.",
  },
  {
    id: "database-dump",
    test: /\.(sqlite3?|db|mdb|dump|bak)$/i,
    message: "Database file or dump — may contain real user data.",
    fix: "Use a seed script that generates synthetic data instead.",
  },
  {
    id: "model-weights",
    test: /\.(onnx|tflite|pt|pth|safetensors|bin|h5|pb|gguf)$/i,
    message:
      "Model weights — too large for git and usually redistributable only by URL.",
    fix: "Fetch at build time or use Git LFS with an explicit ADR.",
  },
  {
    id: "build-output",
    test: /(^|\/)(node_modules|dist|build|out|coverage|\.turbo|\.next|playwright-report|test-results)\//,
    message: "Build output or dependency directory.",
    fix: "These belong in .gitignore, not in history.",
  },
  {
    id: "build-artifact",
    test: /\.(tsbuildinfo|log)$/i,
    message: "Build artifact or log file.",
    fix: "Add to .gitignore.",
  },
];

/** `.npmrc` is legitimate, but not with a token in it. */
function checkNpmrcContent(file, readContent) {
  if (!/(^|\/)\.npmrc$/.test(file)) return null;
  const content = readContent(file);
  if (!content) return null;
  if (/_auth(Token)?\s*=\s*\S+/i.test(content.toString("utf8"))) {
    return {
      file,
      message: "Registry auth token committed in .npmrc [npmrc-token]",
      detail:
        "Revoke the token now, then use NODE_AUTH_TOKEN from CI secrets instead.",
    };
  }
  return null;
}

function isAllowed(file) {
  const normalized = file.replace(/\\/g, "/");
  return ALLOW.some((pattern) => pattern.test(normalized));
}

function main() {
  const all = process.argv.includes("--all");
  const files = all ? trackedFiles() : stagedFiles();
  const sizeOf = all
    ? (file) => {
        try {
          return statSync(file).size;
        } catch {
          return 0;
        }
      }
    : stagedSize;
  const readContent = all
    ? (file) => {
        try {
          return statSync(file).isFile() ? readFileSync(file) : null;
        } catch {
          return null;
        }
      }
    : stagedContent;

  const findings = [];

  for (const file of files) {
    const normalized = file.replace(/\\/g, "/");

    if (!isAllowed(normalized)) {
      const rule = DENY.find((candidate) => candidate.test.test(normalized));
      if (rule) {
        findings.push({
          file,
          message: `${rule.message} [${rule.id}]`,
          detail: rule.fix,
        });
        continue;
      }
    }

    const npmrcFinding = checkNpmrcContent(normalized, readContent);
    if (npmrcFinding) {
      findings.push(npmrcFinding);
      continue;
    }

    const bytes = sizeOf(file);
    if (bytes > MAX_FILE_KB * 1024) {
      findings.push({
        file,
        message: `File is ${(bytes / 1024).toFixed(0)}KB, over the ${MAX_FILE_KB}KB limit [oversized-file]`,
        detail:
          "Large blobs live in git history forever. Use Git LFS, fetch at build time, or raise OMNIVRA_MAX_FILE_KB deliberately with justification in the PR.",
      });
    }
  }

  const code = reportFindings({
    name: "Sensitive path check",
    findings,
    remediation: [
      "Unstage the file:  git restore --staged <file>",
      "Then add it to .gitignore if it is a local-only artifact.",
      "If a credential file was already committed, ROTATE the credential first.",
      "See docs/security/secret-management.md.",
    ],
  });
  process.exit(code);
}

main();
