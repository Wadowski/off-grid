# 0020. Error records are kept in Postgres for a retention period

- **Status:** Accepted

## Context

The server records errors in a memory buffer (`createMemoryErrorSink` in `packages/observability`). The buffer keeps the last 200 records per process. Nothing reads it today. A restart clears it, and with several instances each one keeps only its own errors ([ADR 0019](0019-state-shared-between-instances.md)).

Operators of a home or hosted server need a record of recent errors that survives a restart and covers every instance. The records must not hold personal data. The existing redaction already removes sensitive keys from context and the sink drops messages, so a stored record keeps only the error name, an optional code, the trace id and the redacted context.

Postgres is the only shared store ([ADR 0002](0002-outbox-events-and-projections.md)). Error records belong to the server as a whole, not to one feature module, so they need a schema of their own.

## Decision

We will store error records in a new schema `observability`, in one table `observability.error_record`. Its ownership scope is `instance`: no owner column, the runtime role may write it, and it holds no personal data. Each record has `recorded_at`, `name`, `code`, `trace_id` and the redacted `context`.

We will keep the in-memory buffer for the live view of one process and write each record to Postgres as well. The write is asynchronous and best effort. If the database is unreachable or the write queue is full, the record stays in the buffer and the failure is logged to stdout. An error in the error log must never fail the request or the event delivery that caused it.

We will delete records older than 30 days. Every instance runs the same delete, which is idempotent, so no leader election is needed.

## Consequences

- Recent errors survive restarts and are visible across instances through the database.
- Error records add a write for each recorded error. Writes are bounded by a queue, so an error storm drops records rather than slowing requests.
- The `observability` schema joins the list of database schemas in `infra/init` and in `packages/db`. ADR 0017 keeps the two runtime roles, so no new role is needed.
- The init script runs only on an empty database, and the migration role cannot create a schema. An existing install must therefore create the schema once, as a superuser, before it runs the migration: `CREATE SCHEMA observability AUTHORIZATION offgrid_migrator; REVOKE ALL ON SCHEMA observability FROM PUBLIC; GRANT USAGE ON SCHEMA observability TO offgrid_app;`. The release notes must say so.
- A reader (an admin screen or a query tool) is follow-up work and is not part of this record.
- Retention is fixed at 30 days for now. Making it configurable is follow-up work.
