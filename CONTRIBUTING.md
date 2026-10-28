# Contributing to Offgrid

Thank you for your interest. Offgrid is **source-available** under the [Functional Source License](LICENSE) (FSL-1.1-ALv2). It is not open source. You may run, modify and redistribute it for any purpose except offering a competing commercial product or service. Two years after each release, that release becomes available under Apache-2.0. See [NOTICE](NOTICE) and [TRADEMARK.md](TRADEMARK.md).

## Before you start

- Read the [architecture decision records](docs/adr/README.md) that touch your change.
- For anything larger than a small fix, open an issue first so the approach can be agreed.
- Report security problems privately, as described in [SECURITY.md](SECURITY.md).

## Developer Certificate of Origin (DCO)

Every commit must be signed off. The sign-off certifies that you wrote the change, or otherwise have the right to submit it, under the project's license. The full text is at <https://developercertificate.org>.

Add the sign-off with the `-s` flag:

```bash
git commit -s -m "Describe the change (OG-18)"
```

This adds a trailer that names you as the author:

```text
Signed-off-by: Your Name <you@example.com>
```

The trailer must match the commit's author name and email. To fix a commit you already made, run `git commit --amend -s` (or `git rebase --signoff` for a range).

Check your branch before you open a pull request:

```bash
pnpm dco:check            # checks origin/main..HEAD
pnpm dco:check main..HEAD # or any other range
```

The check fails if any commit in the range lacks a matching sign-off.

## License headers

Every source file (`.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`) starts with an SPDX header:

```ts
// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2
```

Add headers to new files with:

```bash
pnpm license:headers        # add missing headers in place
pnpm license:headers:check  # fail if any file is missing one
```

Files that cannot hold a comment, such as JSON, Markdown and lockfiles, are covered by [REUSE.toml](REUSE.toml). If you add a new kind of file that cannot hold a header, add it to that file.

## REUSE compliance

The repository follows the [REUSE specification](https://reuse.software). To check it locally, install the `reuse` tool once:

```bash
pipx install reuse
```

Then run:

```bash
pnpm reuse:lint
```

## Secrets and dependencies

Offgrid is a public repository. Never commit real credentials, tokens or keys, including in examples. `.env.example` holds placeholders only.

Secrets are caught in three places:

1. **Pre-commit hook.** `pnpm install` installs the git hooks through [lefthook](lefthook.yml). The hook runs gitleaks on the staged changes. Install the [gitleaks](https://github.com/gitleaks/gitleaks#installing) binary first, or the hook fails with a message that says so.
2. **CI.** `.github/workflows/secret-scan.yml` runs gitleaks on every pull request and push to `main`.
3. **History.** `.github/workflows/history-scan.yml` runs trufflehog over the full git history every week.

Rules are in [.gitleaks.toml](.gitleaks.toml). Do not allowlist a path to silence a finding. For a single known false positive, add a `gitleaks:allow` comment to that line and explain it in the commit.

Repository setting (a maintainer enables this once, since it cannot be set from code): **Settings → Code security → Secret protection → Push protection**. This blocks pushes that contain a supported secret type.

Check dependencies for known vulnerabilities with:

```bash
pnpm audit:deps
```

Dependency updates come from [Renovate](renovate.json): weekly, minor and patch updates grouped, major updates in their own pull request, and no automerge.

## Checks before you open a pull request

```bash
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test
pnpm test:scripts
pnpm license:headers:check
pnpm reuse:lint
pnpm dco:check
```

Use `pnpm format` to fix formatting. Use `pnpm changeset` when a published package changes.

## Pull requests

- Keep each pull request focused on one issue.
- Reference the Linear issue in the commit subject, for example `(OG-18)`.
- Describe what changed, why, and how you tested it.
- The owner reviews every change, as set out in [.github/CODEOWNERS](.github/CODEOWNERS).
