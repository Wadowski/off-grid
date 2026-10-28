# Continuous integration

`.github/workflows/ci.yml` runs on every pull request and on every push to
`main`. Each job runs one command from the repository root, and you can run
the same command locally to reproduce a failure. A superseded run for the same
branch is cancelled when a new commit lands.

## Jobs

| Job          | What it checks                                               | Local command                                                                                       |
| ------------ | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| `lint`       | ESLint across the workspace, and Prettier formatting         | `pnpm lint && pnpm format:check`                                                                    |
| `typecheck`  | TypeScript across the workspace                              | `pnpm typecheck`                                                                                    |
| `test`       | Vitest in every package, and the repo script tests           | `pnpm test`                                                                                         |
| `boundaries` | Module boundary rules, see `docs/architecture/boundaries.md` | `pnpm check:boundaries`                                                                             |
| `license`    | SPDX headers, REUSE compliance and the DCO sign-off          | `pnpm license:headers:check && pnpm reuse:lint && pnpm dco:check`                                   |
| `secrets`    | gitleaks over the full git history                           | `gitleaks git --config .gitleaks.toml --redact --exit-code 1 .` (or the Docker command in `ci.yml`) |
| `audit`      | Known vulnerabilities in dependencies, high severity and up  | `pnpm audit:deps`                                                                                   |

`pnpm test` runs the package tests through Turborepo and then `pnpm test:scripts`.
`pnpm dco:check` checks `origin/main..HEAD`. Pass another range to check it
instead, for example `pnpm dco:check main..HEAD`.

Turborepo caches task output between runs in `node_modules/.cache/turbo`. The
pnpm store is cached by `actions/setup-node`. Remote caching is not enabled.

## Required checks

Mark these checks as required in branch protection for `main`. This is a
repository setting the owner applies by hand in **Settings → Branches**. Use the
job names above exactly as they appear in the check list:

- `lint`
- `typecheck`
- `test`
- `boundaries`
- `license`
- `secrets`
- `audit`

`.github/workflows/secret-scan.yml` also runs gitleaks on every pull request and
push to `main`. `history-scan.yml` runs trufflehog over the full history each
week. Both are separate from this workflow.

## Adding a job

Add the job to `ci.yml`, add its row to the table above, and add its name to
the required checks list. Keep the local command here in step with the job.
