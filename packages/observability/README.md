# @offgrid/observability

Purpose: trace ids, structured logs and the error log.
Public API: only what `src/index.ts` exports; never import from `src/` internals.
Owner: platform team

## What it provides

- **Trace context** (`trace.ts`): `runWithTrace`, `currentTraceId`, `resolveTraceId`. The context uses `AsyncLocalStorage`, so the id survives `await` and timers. Ids are 1 to 128 characters from letters, digits, `.`, `_` and `-`. At the HTTP edge, call `resolveTraceId(incomingHeader)` to keep a well-formed id from the caller or start a new one.
- **Structured logger** (`logger.ts`): `createLogger` writes one JSON line per record to stdout, or to an injected `sink`. Every record has `level`, `time`, `msg`, `trace_id` (from the context), and `module` and `family_id` when bound with `child()`.
- **Redaction** (`redact.ts`): keys whose names contain `password`, `secret`, `token`, `auth`, `bearer`, `session`, `refresh`, `jwt`, `credential`, `ssn`, `cookie`, `apikey` or `privatekey` are replaced with `[REDACTED]`. Redaction matches key names only. It does not scan values, so callers must not put personal data or secrets into `msg` or other free text.
- **Error sink** (`error-sink.ts`): `createMemoryErrorSink` is an in-process ring buffer. Each record keeps the error name, an optional string `code`, the trace id and the redacted context. It does not keep the error message, because messages can contain personal data. Nothing leaves the machine.

## Guarantees

- No network calls and no telemetry dependency. The package depends only on Node built-ins.
- Log records are redacted before they are written, and the input value is never mutated.
- A caller cannot override `level`, `time`, `msg` or `trace_id` through log fields.

## Not yet included

- The Fastify plugin. It needs `fastify` as a dependency, which the repo does not have yet. It belongs in the composition root (OG-36).
- The event bus feed into the error sink and the admin error log reader. Both are planned for the event bus and admin work.
- A value-level scan for secrets in free text, and a shared default list of personal field names.
- Trace ids are checked against this package's own pattern. `packages/contracts` still accepts any string of 1 to 128 characters, so a shared schema is needed before event handlers rely on it.
