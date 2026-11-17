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
- DON'T add telemetry, analytics SDKs or outbound network calls in local mode. The exceptions are mail to a mail server that the owner configures, off by default ([ADR 0016](../../docs/adr/0016-local-authentication-model.md), [ADR 0018](../../docs/adr/0018-outgoing-mail-to-a-chosen-provider.md)), web push to a browser subscription that a person created on their own device ([ADR 0024](../../docs/adr/0024-browser-notifications-web-push.md)), and update checks and image pulls to the hosts listed in [ADR 0032](../../docs/adr/0032-outbound-update-check-and-image-pull.md), only on an admin's action or the opt-in nightly run.
- DON'T log personal data or secrets, including in error messages.
- DON'T put real secrets, tokens or hostnames in the repo, including examples. `.env.example` holds placeholders only.
- DON'T put secrets in environment defaults.
- DON'T add a `gitleaks:allow` comment without explaining it in the commit.
