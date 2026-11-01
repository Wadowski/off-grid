---
paths:
  - "modules/identity/**/*"
  - "packages/observability/**/*"
  - "packages/access-control/**/*"
  - "modules/*/src/http/**/*"
---

# Auth-sensitive code rules

Passwords, session tokens and recovery codes are the most sensitive data the project handles. Only the `identity` module reads or writes them ([boundaries.md](../../docs/architecture/boundaries.md)). See [ADR 0016](../../docs/adr/0016-local-authentication-model.md).

- DON'T log secrets: passwords, tokens, recovery codes, hashes, or `authorization`, `cookie` and session fields. The shared logger redacts them by key name, but do not rely on that alone.
- DON'T return a password hash, a recovery-code hash or a session secret from any HTTP response, event or projection.
- DO hash passwords with Argon2id ([ADR 0016](../../docs/adr/0016-local-authentication-model.md)). Use the shared hashing helper once it exists in the repo. Until then, do not add a second hashing path in a module.
- DO compare secrets in constant time. Use the shared comparison helper once it exists. Never compare with `===`.
- DON'T invent a second way to read the current user. Read the user and family from the request context set by the server (`withUserContext`, `withFamilyContext`), never from a request body, query string or path parameter.
- DON'T import `modules/identity` internals from any other module. Use `modules/identity/src/index.ts`.
- DON'T put secrets in test fixtures that outlive the test. Use generated values, and never a real key.
- DO add a test that proves a secret never reaches the logger output when you add a new path that handles one.

The review checklist for auth-related pull requests is in [.github/pull_request_template.md](../../.github/pull_request_template.md).
