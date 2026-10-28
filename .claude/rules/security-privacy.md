---
paths:
  - "**/*"
---

# Security and privacy rules

Offgrid is local-first and privacy-first ([CLAUDE.md](../../CLAUDE.md) non-negotiables).

- DO validate all input with zod, at every boundary.
- DO hash passwords with Argon2id.
- DO load secrets only from Docker secrets or files.
- DO fail fast when a required secret is missing.
- DON'T add telemetry, analytics SDKs or outbound network calls in local mode.
- DON'T log personal data or secrets, including in error messages.
- DON'T put real secrets, tokens or hostnames in the repo, including examples. `.env.example` holds placeholders only.
- DON'T put secrets in environment defaults.
- DON'T add a `gitleaks:allow` comment without explaining it in the commit.
