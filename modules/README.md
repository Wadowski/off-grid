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

Rules: other packages import only from `@offgrid/<name>` (never from `src/` internals), and modules never read another module's schema.
