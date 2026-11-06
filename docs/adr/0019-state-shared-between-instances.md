# 0019. State that must be shared between server instances lives in Postgres

- **Status:** Proposed

## Context

The server is a single process today, and the local-first deployment runs one instance. A hosted or cloud deployment can run several instances behind a load balancer, and the same can happen with a restarted or scaled-out process. Any state held only in one process's memory then behaves differently depending on which instance answers a request.

[ADR 0002](0002-outbox-events-and-projections.md) rules out Redis and other external brokers, so a shared store must be Postgres, which the server already depends on.

A review of the code on the OG-54 branch found these in-process stores:

- **Rate limits** (`@fastify/rate-limit`, global and per route). The default store is in memory. With N instances an attacker gets about N times the intended rate, and the limit resets on restart.
- **Sign-in and recovery lockouts, and the emailed-code cooldown.** These were in memory and moved to the `identity.attempt_counter` table in OG-54, so they now work across instances.
- **The error log** (`packages/observability`, the in-memory error sink). It keeps the last errors in a ring buffer, so each instance shows only its own errors.
- **Email retries** (`send-with-retry`). These are timers in one process. An instance that stops loses its pending retries, so a notice can be dropped. This is a delivery guarantee problem, not shared-state consistency, and it is tracked separately.
- **Outbox publisher flags** (`publisherRunning`, `draining`) and the outbox cursor lock. The flags describe the process's own lifecycle, and the cursor lock already lives in Postgres ([ADR 0011](0011-restricted-event-access-and-retention.md)).
- **The dummy password hash** cached in `identity`. It is computed per process to keep sign-in timing constant. It does not need to match across instances.

## Decision

We will keep any state that must agree across server instances in Postgres. That includes counters, lockouts, cooldowns, rate limits, one-time codes, sessions and claimed work. Each piece of state lives in the schema of the module that owns it, or in an `instance`-scope table when no user owns it. Every write is atomic, so two instances cannot both claim the same slot. Every entry carries a stored expiry, and a job removes expired rows.

We will keep in process memory only state that is per instance by nature: connection pools, lifecycle flags of the running process, a compiled or precomputed value that changes no behaviour, and logs.

We will move the rate-limit store to Postgres. This is follow-up work and is not done yet.

## Consequences

- Rate limits, lockouts and cooldowns hold across instances and across restarts. Each write costs a small transaction, which is acceptable at household scale and should be measured before a hosted deployment.
- Tables grow with the number of distinct keys. The `identity.attempt_counter` table needs a pruning job before a hosted deployment.
- The rate-limit store change needs its own change and tests. Until it lands, the existing per-process rate limits are a known gap for multi-instance use.
- The error log is stored in Postgres by [ADR 0020](0020-error-records-in-postgres.md). The in-memory buffer remains per instance as a live view only.
- Email retries stay in process until delivery is made durable. This ADR does not decide that.
- Reviewers and agents must check new code against this record. The rule in `.claude/rules/shared-state.md` enforces it.
