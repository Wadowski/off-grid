# @offgrid/test-db

Purpose: a throwaway Postgres for integration tests. It starts a container, runs the shared init scripts, provisions one login per schema, applies the migrations given by the caller, and returns handles to connect as each app role.
Public API: only what `src/index.ts` exports; never import from `src/` internals.
Owner: platform team

Each login uses the same random password. A login can reach only its own schema. The caller creates Prisma clients for its own modules.

## One container per test run

`pnpm test` runs `src/run-with-shared-database.ts` (compiled to `dist/`). The runner starts one `postgres:17-alpine` container, creates the two login roles once with random per-run passwords, and writes the connection details to a file in a private temporary directory (mode 0600). It sets `OFFGRID_TEST_DATABASE_FILE` to that file for the child command, `turbo run test`, which passes the variable through to each package's tests.

`startTestDatabase` reads that file. When it is present, each test file calls `CREATE DATABASE offgrid_test_<random>` in the shared container, runs the init scripts in it, and drops it with `DROP DATABASE ... WITH (FORCE)` in `stop()`. The shared container is never stopped by a test file. When the variable is not set, `startTestDatabase` starts a private container as before, so `pnpm --filter <package> test` and IDE runs keep working.

The container is stopped when the child exits. SIGINT, SIGTERM and SIGHUP are forwarded to the child. A second signal kills the child with SIGKILL. A runner killed with SIGKILL leaves the container to Testcontainers' Ryuk, which removes it after the runner's connection closes (about 11 seconds on the development host). Containers labelled `org.offgrid.test-db=shared-cluster` are the shared ones.

Cluster-level state (roles, passwords, server settings) is created only by the runner. A test file must not run `ALTER ROLE`, `CREATE ROLE`, `ALTER SYSTEM`, `ALTER DATABASE`, `CREATE EXTENSION`, `pg_terminate_backend` or read `pg_roles`; `src/no-cluster-level-sql.test.ts` fails when one does.

The shared container runs with `max_connections=300` and with `fsync`, `synchronous_commit` and `full_page_writes` off. These are speed settings for disposable test data. They are not timeouts.

The package does not depend on `@offgrid/db`, so `@offgrid/db` can use it in its tests without a dependency cycle.
