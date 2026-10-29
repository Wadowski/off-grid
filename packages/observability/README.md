# @offgrid/observability

Purpose: trace ids, structured logs and the error log.
Public API: only what `src/index.ts` exports; never import from `src/` internals.
Owner: platform team

## What it provides

- **Trace context** (`trace.ts`): `runWithTrace`, `currentTraceId`, `resolveTraceId`. The context uses `AsyncLocalStorage`, so the id survives `await` and timers. At the HTTP edge, call `resolveTraceId(incomingHeader)` to keep a well-formed id from the caller or start a new one. When an event is written to the outbox, copy `currentTraceId()` onto it. When a handler runs, wrap it in `runWithTrace(event.traceId, ...)`.
- **Structured logger** (`logger.ts`): `createLogger` writes one JSON line per record to stdout, or to an injected `sink`. Every record has `level`, `time`, `msg`, `trace_id` (from the context), and `module` and `family_id` when bound with `child()`.
- **Redaction** (`redact.ts`): keys whose names contain `password`, `secret`, `token`, `authorization`, `cookie`, `apikey` or `privatekey` are replaced with `[REDACTED]`. Pass `extraKeys` to redact configured personal fields. The logger applies redaction to every record.
- **Error sink** (`error-sink.ts`): `createMemoryErrorSink` is an in-process ring buffer. The event bus feeds it from the dead-letter queue, and the admin error log reads it. Nothing leaves the machine.

## Guarantees

- No network calls and no telemetry dependency. The package depends only on Node built-ins.
- Log records are redacted before they are written, and the input value is never mutated.
- A caller cannot override `trace_id` through log fields.

## Not yet included

- The Fastify plugin. It needs `fastify` as a dependency, which the repo does not have yet. It belongs in the composition root (OG-36).
