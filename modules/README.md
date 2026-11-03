# Modules

Each folder here is one module of the modular monolith (`@offgrid/<name>`), running in the single server process and owning one Postgres schema.

Standard layout (reference implementation: `modules/family`; the other modules stay stubs until they are built):

```
modules/<name>/src/
  domain/          pure business logic, no I/O
  application/     commands and queries (use cases)
  infrastructure/  repositories and migrations for the module's own schema only
  http/            Fastify routes
  events/          events published and handled
  workers/         background jobs
  index.ts         the only public entry point
```

### Folders inside a layer

A layer folder stays flat while it holds up to about 8 files. Past that, group the files into subfolders **by feature** (`application/sessions/`, `infrastructure/credentials/`, `http/admin/`), never by kind of file. The one exception is errors:

- `application/errors/`: all error classes of the module, one per file.
- `http/<feature>/`: each `send-*-error` mapper sits beside the routes that use it.
- `infrastructure/tokens/`, `infrastructure/database/` and similar: low-level primitives shared by several features, named for what they are.
- `http/cookies/` and similar: HTTP-only helpers belong in `http/`, never in `infrastructure/`.
- A test file lives beside the file it tests. A cross-cutting integration test goes in the folder of the feature it mostly exercises, or stays at the layer root.
- `index.ts`, `<name>-module.ts`, `types.ts` and `constants.ts` stay at `src/`. Route wiring (`register-<name>-routes.ts`) stays at the `http/` root.

`modules/identity` is the reference for this grouping.

Rules: other packages import only from `@offgrid/<name>` (never from `src/` internals), and modules never read another module's schema.
