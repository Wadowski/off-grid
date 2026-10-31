# Continuous integration

`.github/workflows/ci.yml` runs on every pull request, on every push to `main`,
every night and on manual dispatch. The pull request jobs run on each change;
the end-to-end full suite runs on `main` and at night. Each job runs one command from the repository root, and you can run
the same command locally to reproduce a failure. A superseded run for the same
branch is cancelled when a new commit lands.

## Jobs

| Job           | What it checks                                                               | Local command                                                                                       |
| ------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `lint`        | ESLint across the workspace, Prettier formatting, and the telemetry denylist | `pnpm lint && pnpm format:check && pnpm check:no-telemetry`                                         |
| `typecheck`   | TypeScript across the workspace                                              | `pnpm typecheck`                                                                                    |
| `test`        | Vitest in every package, and the repo script tests                           | `pnpm test`                                                                                         |
| `contracts`   | Released event schemas and the committed `openapi.json`                      | `pnpm check:contracts`                                                                              |
| `boundaries`  | Module boundary rules, see `docs/architecture/boundaries.md`                 | `pnpm check:boundaries`                                                                             |
| `license`     | SPDX headers, REUSE compliance and the DCO sign-off                          | `pnpm license:headers:check && pnpm reuse:lint && pnpm dco:check`                                   |
| `secrets`     | gitleaks over the full git history                                           | `gitleaks git --config .gitleaks.toml --redact --exit-code 1 .` (or the Docker command in `ci.yml`) |
| `audit`       | Known vulnerabilities in dependencies, high severity and up                  | `pnpm audit:deps`                                                                                   |
| `wip-tags`    | Changed feature files that still carry `@wip` are named in the PR body       | `pnpm check:wip-tags` (reads `BASE_REF` and `PR_BODY` from the environment)                         |
| `e2e-smoke`   | Builds the server image, starts the compose stack, runs `@smoke` scenarios   | `pnpm --filter @offgrid/e2e e2e:stack:up && pnpm e2e:smoke`                                         |
| `e2e-full`    | Builds the stack, runs every non-`@wip` scenario, reports stack memory       | `pnpm --filter @offgrid/e2e e2e:stack:up && pnpm --filter @offgrid/e2e e2e`                         |
| `stack-guard` | Stack with no outbound network still answers `/api/health/ready`             | `pnpm check:stack-egress` (needs Docker)                                                            |

`stack-guard` runs on changes to `infra/`, `apps/`, `modules/`, `packages/`,
`pnpm-lock.yaml` or a `Dockerfile`, and always on nightly and manual runs. On other
changes it reports success without starting the stack, so the required check
is never left pending.

`e2e-smoke` runs on pull requests. `e2e-full` runs on pushes to `main`, nightly
and on manual dispatch. On a failure, `e2e-smoke` and `e2e-full` add the last
200 lines of the service logs to the job summary and upload the Playwright
traces and the service logs as an artifact kept for 7 days. Videos and
screenshots are not uploaded.

`e2e-full` writes a memory table for each container, from `docker stats`, to its
job summary. Set the repository variable `OFFGRID_MEMORY_BUDGET_MB` to fail the
job when the stack's total memory goes over that number, in MiB. The variable is
unset by default, so the job only reports. The owner sets the budget; do not
guess one. The job also records how long the full suite took.

`e2e-full` runs one shard by default. To split the suite, change the `shard` and
`total` matrix lists in `ci.yml` together.

`pnpm test` runs the package tests through Turborepo and then `pnpm test:scripts`.
`pnpm dco:check` checks `origin/main..HEAD`. Pass another range to check it
instead, for example `pnpm dco:check main..HEAD`.

The telemetry denylist check is described in `docs/privacy-guards.md`.

Turborepo caches task output between runs in `node_modules/.cache/turbo`. The
pnpm store is cached by `actions/setup-node`. Remote caching is not enabled.

## Required checks

Mark these checks as required in branch protection for `main`. This is a
repository setting the owner applies by hand in **Settings → Branches**. Use the
job names above exactly as they appear in the check list:

- `lint`
- `typecheck`
- `test`
- `contracts`
- `boundaries`
- `license`
- `secrets`
- `audit`
- `wip-tags`
- `e2e-smoke`
- `stack-guard`

`e2e-full` is not required on pull requests because it does not run on them.

`.github/workflows/secret-scan.yml` also runs gitleaks on every pull request and
push to `main`. `history-scan.yml` runs trufflehog over the full history each
week. Both are separate from this workflow.

## Adding a job

Add the job to `ci.yml`, add its row to the table above, and add its name to
the required checks list. Keep the local command here in step with the job.
