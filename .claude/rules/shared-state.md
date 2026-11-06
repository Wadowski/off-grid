---
paths:
  - "apps/main-server/src/**"
  - "modules/*/src/**"
  - "packages/*/src/**"
---

# Shared state rules

The server may run as several instances. State that must agree between them lives in Postgres ([ADR 0019](../../docs/adr/0019-state-shared-between-instances.md)).

- DO store any counter, lockout, cooldown, rate limit, one-time code, claim or other state that every instance must see in Postgres, in the owning module's schema. Use an `instance`-scope table when no user owns the row.
- DO make each write atomic: an upsert, a conditional `updateMany`, or a transaction. Don't read a value, decide, then write it back in a separate request.
- DO store an expiry timestamp on every entry that expires, and make sure a job prunes expired rows.
- DO key a row by a digest of the subject, not the raw email or address, when the subject may not have an account.
- DON'T use a module-level `Map`, `Set`, `let` or closure as the source of truth for state that another request or instance must see.
- DON'T add a new in-memory rate limit or store. The existing global and per-route limits in `apps/main-server` are tracked in ADR 0019 and are not a pattern to copy.
- DON'T add Redis or another external store without a new ADR that supersedes [ADR 0002](../../docs/adr/0002-outbox-events-and-projections.md) for that case.
- DO keep in process memory only state that is per instance by nature: a connection pool, the lifecycle flags of the running process, a precomputed value that changes no behaviour (such as the dummy password hash), and logs.
- DO note in the PR body any new in-process state, and say why it is per instance.
