# Module boundaries

`pnpm check:boundaries` enforces the boundaries of the modular monolith
([ADR 0006](../adr/0006-modular-monolith.md)). It runs dependency-cruiser with
`.dependency-cruiser.cjs` over `apps/`, `modules/` and `packages/`, and CI runs
it in the `boundaries` job. A violation fails the build and prints the rule
name, the two files, and a pointer to the ADR.

Each rule has a fixture under `tools/boundary-fixtures/<rule>/` that violates
it on purpose. `scripts/check-boundaries.test.mjs` checks that every fixture
fails its rule and that the real tree passes. `tools/boundary-fixtures/allowed/`
holds legal imports that must pass.

| Rule                                  | What it forbids                                                                                                                                                                                | Why                                                                                        |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `module-public-api`                   | A module importing another module anywhere except that module's `src/index.ts`. Its own files and `packages/contracts` are fine.                                                               | Modules stay extractable: the public surface is one file, and other data arrives by event. |
| `modules-not-import-apps`             | Any import from `modules/*` into `apps/*`.                                                                                                                                                     | Apps wire modules together, so the dependency runs one way only.                           |
| `packages-not-import-apps-or-modules` | Any import from `packages/*` into `apps/*` or `modules/*`.                                                                                                                                     | Shared packages are the bottom layer. Feature code cannot leak into them.                  |
| `web-allowed-imports`                 | Any workspace import from `apps/main-web` other than `packages/contracts`, `packages/api-client` and `packages/ui`.                                                                            | The web app talks to the server through the typed API client and shared contracts only.    |
| `domain-no-io`                        | Any import from a module's `src/domain/` of an I/O library (Prisma, Fastify, `pg`, `undici`, `axios`, `got`, `node-fetch`, `fs`, `net`, `http`, `https`, `dns`, `child_process`, and similar). | Domain logic is pure, so it is testable without a database or network.                     |
| `domain-no-adapter-layers`            | Any import from a module's `src/domain/` of `infrastructure/`, `http/`, `events/` or `workers/` in the same module.                                                                            | Adapters depend on the domain, never the reverse.                                          |
| `no-circular`                         | Any import cycle between files.                                                                                                                                                                | Cycles make modules impossible to extract or load in isolation.                            |

Type-only imports count as imports. A domain file that imports a type from
Prisma breaks `domain-no-io` just as a value import would.

## Adding a rule

1. Add the rule to `.dependency-cruiser.cjs` with a `comment` that points to this file or to an ADR.
2. Add a fixture under `tools/boundary-fixtures/<rule>/` that violates it.
3. Add the rule name to `RULES` in `scripts/check-boundaries.test.mjs`.
4. Add a row to the table above.

Rules for cloud-only modules (billing, entitlements, gateway) are not written
yet, because those modules do not exist.
