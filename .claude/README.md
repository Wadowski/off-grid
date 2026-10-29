# Agent guardrails

This folder configures Claude Code for this repository. The written rules in `rules/` and `skills/` tell the agent what to do. The guardrails here enforce the most important of them mechanically, so a mistake is stopped rather than hoped against.

`pnpm check:agent-config` (also the `agent-config` CI job) validates this folder: `settings.json` parses, every hook script exists and is executable, every rule has a `paths:` list, every skill has a matching `name` and a `description`, and every agent in `agents/` has a matching `name`, a `description` and a `tools` list with no write or network tool.

## Permissions (`settings.json`)

**Allowed without a prompt:** `pnpm` commands, read-only git commands (`status`, `diff`, `log`, `show`, `branch`, `rev-parse`), `docker compose`, and the file tools (`Read`, `Glob`, `Grep`, `Edit`, `Write`). The file tools are still checked by the hooks below.

**Denied:**

- Reading `.env*`, anything under `data/`, and anything under a `secrets/` directory.
- `rm -rf` and `rm -fr`. Build output is removed by the build tooling, not by hand.
- Force pushes, `git reset --hard`, and pushing directly to `main`.
- Piping a download into a shell.
- Global package installs.

Deny rules win over allow rules. A denied command needs a human to run it.

## Hooks (`hooks/`)

| Hook                | When                           | What it does                                                                                                                               |
| ------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `protect-files.mjs` | Before every `Edit` or `Write` | Blocks protected files and Accepted ADRs (only the status line of an Accepted ADR may change).                                             |
| `format-file.mjs`   | After every `Edit` or `Write`  | Runs Prettier on the file, and ESLint `--fix` on TypeScript and JavaScript. Remaining lint errors are sent back to the agent.              |
| `stop-checks.mjs`   | When the agent finishes a turn | Runs `pnpm typecheck` and `pnpm check:boundaries`. A failure is sent back so the agent fixes it before stopping. Slower suites stay in CI. |

A hook that blocks exits with code 2 and writes the reason to stderr, which the agent reads. Each hook is a plain Node script with no dependencies beyond the repo's own tools.

### Protected files

The hook blocks edits to these, because they guard licensing, secret scanning, module boundaries, CI and the agent setup itself:

- `.dependency-cruiser.cjs`, `.gitleaks.toml`
- `LICENSE`, `NOTICE`, `CODEOWNERS`, `.github/CODEOWNERS`
- anything under `.github/workflows/`
- `.claude/settings.json` and anything under `.claude/hooks/`
- any ADR in `docs/adr/` whose status is Accepted, unless only its `**Status:**` line changes. To change an accepted decision, write a new ADR that supersedes it.

### Making a deliberate change

Protected files are protected, not frozen. When the user has explicitly asked for a change to one of them, start the session with the override:

```bash
OFFGRID_ALLOW_PROTECTED_EDITS=1 claude
```

Do not set the override to get past a block you were not asked to cross. If a guardrail itself needs to change, edit the hook or `settings.json` in a reviewed PR, and say why in the description.

## Adding or changing a guardrail

1. Change the rule in `settings.json`, or the hook script.
2. Add or update a test in `scripts/agent-hooks.test.mjs` or `scripts/check-agent-config.test.mjs`. The tests run a hook as a subprocess against a temporary project, so they show the real exit code.
3. Run `pnpm test:scripts` and `pnpm check:agent-config`.
4. Update the table above, so the next reader knows what the guardrail does.

Hooks should finish in a few seconds on a normal change. The `Stop` hook is the slowest, so keep it to fast checks.
