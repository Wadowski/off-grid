# 0036. The migrator owns the database and the init-created objects

- **Status:** Proposed

## Context

[0017](0017-shared-database-roles-and-prisma-migrate.md) makes `offgrid_migrator` the owner of every module schema and table. The database itself, and the `public.offgrid_declare_scope` helper, were created by the image's superuser and by the init scripts in `infra/init/sql/`. They are owned by the superuser.

The updater's backup and restore ([OG-166](https://linear.app/offgridos/issue/OG-166)) runs `pg_restore --clean --if-exists` as `offgrid_migrator`, with no superuser login. Restoring a dump drops and recreates the helper and alters the database, so the restore failed with ownership errors. Three options were considered:

- Restore as a superuser, or with `--no-owner` and a superuser login in the updater. This widens the credential the updater holds, and the owner decision is made by the user.
- Reassign everything owned by the superuser with `REASSIGN OWNED BY`. This also touches system objects, so it is unsafe.
- Move ownership of the database and of the init-created objects to `offgrid_migrator`, so the restore runs with the role it already uses.

Applied init scripts (`00`, `01`, `02`) and applied Prisma migrations cannot be edited. A Prisma migration cannot perform this change either, because it runs as `offgrid_migrator`, which cannot alter a database or a function it does not own.

## Decision

- We will move ownership of the database and of the superuser-created helper to `offgrid_migrator`, in a new idempotent init file, `infra/init/sql/03-migrator-ownership.sql`. It runs as the superuser. It alters the database owner with `ALTER DATABASE ... OWNER TO offgrid_migrator` and the helper owner with `ALTER FUNCTION public.offgrid_declare_scope(text, text, text) OWNER TO offgrid_migrator`. Any further superuser-owned object that a restore reveals is added to this file.
- Fresh installs run `03` through the database image's init directory. The test database runs it through `INIT_SCRIPTS` in `packages/test-db`.
- Existing installs run the same file once per stack start through the one-shot compose service `db-ownership`. It runs before `init`, as the superuser, with the password read from the `postgres-password` Docker secret file. Repeated runs change nothing.
- The updater restore stays `pg_restore --clean --if-exists` as `offgrid_migrator`. It never uses `--no-owner` and never connects as a superuser. The integration test asserts that no object in `public` or a module schema is owned by a superuser after a restore.
- The `offgrid_app` runtime role is unchanged. Owners are not the runtime role, so row-level security still applies to the runtime role.

## Consequences

- Easier: the updater restores with the one credential it already holds, and the database owner matches the role that migrates the data.
- Harder: `offgrid_migrator` now holds database-level privileges, such as `ALTER DATABASE`, on the database it already owned schemas and tables in. The migration credential stays off the server, as [0017](0017-shared-database-roles-and-prisma-migrate.md) requires.
- The ownership change reaches existing installs only when the stack starts through `db-ownership`. An install that restores a backup taken before the change must run that service first. Any update path, including the updater, must apply it before it relies on a restore. The preflight that checks the database owner before an update is follow-up work for [OG-167](https://linear.app/offgridos/issue/OG-167).
- Rolling back means removing `03` and the `db-ownership` service. The ownership that has already moved stays. Restoring superuser ownership is a manual `ALTER ... OWNER TO` by an operator.
- Each later init or migration that creates a superuser-owned object must be added to `03`, or the restore of a backup taken after it will fail. The integration test catches this.
- [0017](0017-shared-database-roles-and-prisma-migrate.md) is amended by this record: the migration role owns the database and the init-created helper, not only the module schemas and tables.
