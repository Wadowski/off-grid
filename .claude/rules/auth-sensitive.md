---
paths:
  - "modules/identity/**"
  - "packages/observability/**"
  - "packages/access-control/**"
  - "modules/*/src/http/**"
---

# Auth-sensitive code rules

Passwords, session tokens and recovery codes are the most sensitive data the project handles. Only the `identity` module reads or writes them ([boundaries.md](../../docs/architecture/boundaries.md)). See [ADR 0016](../../docs/adr/0016-local-authentication-model.md).

- DON'T log secrets: passwords, tokens, recovery codes, hashes, or `authorization`, `cookie`, session, OTP and TOTP fields. The shared logger redacts them by key name. Key names are a backstop, not the guarantee, so never pass a secret into a log call at all.
- DON'T put secret values in error messages. The logger copies an error's `message` and `stack` as they are.
- DON'T return a password hash, a recovery-code hash or a session secret from any HTTP response, event or projection.
- DO hash passwords with Argon2id ([ADR 0016](../../docs/adr/0016-local-authentication-model.md)). The shared hashing helper does not exist in the repo yet. Until it does, do not add a second hashing path in a module.
- DO compare secrets in constant time. The shared comparison helper does not exist in the repo yet. Never compare secrets with `===`.
- DON'T invent a second way to read the current user. Read the user and family from the request context set by the server (`withUserContext`, `withFamilyContext`), never from a request body, query string or path parameter.
- DON'T import `modules/identity` internals from any other module. Use `modules/identity/src/index.ts`.
- DON'T put secrets in test fixtures that outlive the test. Use generated values, and never a real key.
- DO add a test that shows a secret never reaches logger output when a new path handles one.

Known redaction limits, which are accepted for now:

- Keys containing `hash` are redacted even when they hold a non-secret hash, such as a file checksum. That only hides debug data.
- `pin` is not on the list, because it matches unrelated words such as `shipping`. Name PIN fields so they match a listed word, or add a specific word.

The review checklist for auth-related pull requests is in [.github/pull_request_template.md](../../.github/pull_request_template.md).
