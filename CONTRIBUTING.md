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

## Cutting a release

A release is a `vX.Y.Z` tag on a commit of `main`. The release workflow in `.github/workflows/release.yml` does the rest.

1. Make sure `main` is green and contains the change to release.
2. Change `MINIMUM_UPDATE_FROM` only when installations older than the new version cannot update through it, for example after a migration that cannot be skipped. The file holds one semver line and starts at `0.0.0`.
3. Tag the commit and push the tag:

   ```bash
   git tag -s v1.2.3 -m "OffGrid 1.2.3"
   git push origin v1.2.3
   ```

4. The workflow refuses the tag if it is not on `main`, if the version is below `MINIMUM_UPDATE_FROM`, or if a release for the tag already exists. Otherwise it builds `offgrid-main-server`, `offgrid-main-web` and `offgrid-updater` for `linux/amd64` and `linux/arm64`, pushes them to `ghcr.io/<owner>/offgrid-main-server`, `ghcr.io/<owner>/offgrid-main-web` and `ghcr.io/<owner>/offgrid-updater` with the tags `1.2.3` and `1.2`, and creates a GitHub Release with `release-manifest.json`, `docker-compose.production.yml`, `production.env.example` and `SHA256SUMS` attached. The last three are the install script's files; `SHA256SUMS` holds their SHA-256 checksums, which the install script checks before it uses them.
5. On the first push GitHub creates the three packages as private. Set each package to public in the repository's package settings, or the updater cannot pull the images without credentials.

The workflow never pushes a `latest` tag. Images are referenced by digest in the manifest, and the manifest is not signed yet; see [ADR 0032](docs/adr/0032-outbound-update-check-and-image-pull.md).

To rehearse the release on a fork, enable Actions on the fork and push a `vX.Y.Z` tag to its `main`. Delete the fork's release and package versions afterwards. A bad release is never fixed by re-pushing its tag: delete the GitHub Release and the package version, then cut the next patch version.
