# CLAUDE.md

## Repo map

- `apps/main-server/`: the server process that wires modules together
- `apps/main-web/`: the React + Vite web app
- `modules/<name>/`: one folder per feature module (access, calendar, export, family, files, food, identity, lists, notes, notifications, relations); see `modules/README.md`
- `packages/contracts/`: shared schemas, event types and OpenAPI
- `packages/api-client/`: typed client for the server API
- `packages/ui/`: design tokens and shared UI components
- `packages/db/`: database schemas, migrations and RLS helpers
- `packages/event-bus/`: versioned event publishing and handling
- `packages/access-control/`: family and access-group checks
- `packages/observability/`: trace ids, structured logs and error log
- `e2e/`: Gherkin features, steps and support code (Playwright-BDD)
- `infra/`: Compose and init scripts
- `docs/adr/`: architecture decision records
- `scripts/`: repo tooling (DCO, SPDX headers) with `node --test` tests
- `.claude/`: agent rules, skills and guardrails
- `.github/`: CI workflows and CODEOWNERS

## Commands

Run from the repo root. Use `pnpm`, not npm or yarn.

```bash
pnpm build
pnpm typecheck
pnpm lint
pnpm test
pnpm test:scripts
pnpm format:check        # pnpm format fixes formatting
pnpm license:headers:check
pnpm reuse:lint
pnpm dco:check
pnpm check:boundaries    # added later by OG-21 (currently a placeholder)
pnpm e2e                 # added later by the e2e framework issue (OG-33)
pnpm e2e:smoke           # added later by the e2e framework issue (OG-33)
```

Starting the Docker Compose stack: not available yet (`infra/compose/` is still empty).

## Non-negotiables

- No telemetry, analytics SDKs or outbound network calls in local mode. The one exception is outgoing mail to an SMTP relay on the local network that the owner configures, off by default (see [ADR 0016](docs/adr/0016-local-authentication-model.md)).
- No secrets, tokens or real hostnames in the repo. Config is validated with zod, and missing secrets fail fast.
- Modules talk only through versioned events and `packages/contracts`. A module touches only its own Postgres schema. Projections are read-only copies of another module's data; a module reads its own data directly.
- Never edit an applied migration or a released event version. Add a new one.
- Access control, data export and (future) remote access are never feature-gated.
- Never weaken or skip CI checks, boundary rules, hooks or tests to make a change pass.

## Workflow

1. Write or update the Gherkin `.feature` file first.
2. Implement the change.
3. Run the verification commands above.

Commits must be signed off with `git commit -s` (see [CONTRIBUTING.md](CONTRIBUTING.md)).

## Definition of Done

- Feature scenarios exist and pass.
- Unit and integration tests are added.
- `pnpm lint`, `pnpm typecheck` and `pnpm check:boundaries` pass.
- No `@wip` tags are left on finished work.
- An ADR is written if a decision changes (see [docs/adr/README.md](docs/adr/README.md)).
- Docs are updated.

## Where detail lives

- `.claude/rules/`: path-scoped rules for agents (added by OG-25)
- `.claude/skills/`: repeatable agent workflows
- `.claude/agents/`: read-only reviewers (architecture, privacy, code quality, Gherkin) run before a PR
- `docs/adr/`: architecture decisions
- `docs/workflow.md`: agent and contributor workflow (added by OG-24)
- `docs/architecture/overview.md`: how the server, modules, database and web app fit together; `docs/architecture/boundaries.md` for the enforced module rules
- `docs/glossary.md`: terms used in the code and docs
- `docs/privacy.md`: plain-language privacy statement for the local server
