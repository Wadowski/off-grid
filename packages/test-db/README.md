# @offgrid/test-db

Purpose: a throwaway Postgres for integration tests. It starts a container, runs the shared init scripts, provisions one login per schema, applies the migrations given by the caller, and returns handles to connect as each app role.
Public API: only what `src/index.ts` exports; never import from `src/` internals.
Owner: platform team

Each login uses the same random password. A login can reach only its own schema, so a test that connects as `family_app` cannot read another schema.
