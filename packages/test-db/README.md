# @offgrid/test-db

Purpose: a throwaway Postgres for integration tests. It starts a container, runs the shared init scripts, provisions one login per schema, applies the migrations given by the caller, and returns handles to connect as each app role.
Public API: only what `src/index.ts` exports; never import from `src/` internals.
Owner: platform team

Each login uses the same random password. A login can reach only its own schema. The caller creates Prisma clients for its own modules.

## One container per test run

`pnpm test` runs `src/cli.ts` (compiled to `dist/cli.js`). The runner starts one `postgres:17-alpine` container, gives the container superuser and creates the two login roles once, each with a random per-run password, and writes the connection details to a file in a private temporary directory (mode 0600). It sets `OFFGRID_TEST_DATABASE_FILE` to that file for the child command, `turbo run test`, which passes the variable through to each package's tests. The variable name is the contract between three places: the runner (`src/constants.ts`, `SHARED_DATABASE_FILE_ENV`), `turbo.json` (`passThroughEnv`) and the tests (`readConnectionFile`). Renaming it means changing all three.

`startTestDatabase` reads that file. When it is present, each test file calls `CREATE DATABASE offgrid_test_<random>` in the shared container, runs the init scripts in it, and drops it with `DROP DATABASE ... WITH (FORCE)` in `stop()`. The shared container is never stopped by a test file. When the variable is not set, `startTestDatabase` starts a private container as before, so `pnpm --filter <package> test` and IDE runs keep working.

The container is stopped when the child exits. SIGINT, SIGTERM and SIGHUP are forwarded to the child. A second signal kills the child with SIGKILL. A runner killed with SIGKILL leaves the container to Testcontainers' Ryuk, which removes it after the runner's connection closes (about 11 seconds on the development host). Containers labelled `org.offgrid.test-db=shared-cluster` are the shared ones.

A runner killed with SIGKILL also cannot delete the connection file. The file stays in its private temporary directory, with the run's passwords, until the operating system clears temporary files. It does not outlive the container for practical purposes, but it is not removed by the runner.

Cluster-level state (roles, passwords, server settings) is created only by the runner. A test file must not run `ALTER ROLE`, `CREATE ROLE`, `ALTER SYSTEM`, `ALTER DATABASE`, `CREATE EXTENSION`, `pg_terminate_backend` or read `pg_roles`. `src/no-cluster-level-sql.test.ts` checks this by matching those words in the source of `apps/`, `modules/` and `packages/`, outside this package. It is a heuristic guardrail, not enforcement: it misses SQL built at run time, SQL in other languages and statements in files it does not scan, and a match in a comment or string fails it too.

The shared container runs with `max_connections=300` and with `fsync`, `synchronous_commit` and `full_page_writes` off. These are speed settings for disposable test data. They are not timeouts.

The package does not depend on `@offgrid/db`, so `@offgrid/db` can use it in its tests without a dependency cycle.
