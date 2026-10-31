# Privacy statement

This page says, in plain language, what the local Offgrid server does with your data and what it does not do. The technical checks behind these statements are described in [privacy-guards.md](privacy-guards.md).

## What it does not do

- **Nothing leaves the machine.** The server and the web app run on your own host. They do not call any cloud service, and local mode makes no outbound network calls.
- **No telemetry.** There are no analytics, tracking or crash-reporting SDKs, and no usage data is collected. `pnpm check:no-telemetry` fails the build if one is added.
- **No accounts with third parties.** Offgrid does not sign you in with an outside identity provider, and it does not need an account with anyone to run.

## What it stores, and where

| What                                                 | Where                                     |
| ---------------------------------------------------- | ----------------------------------------- |
| Your data (families, memberships, and later modules) | The `offgrid-db` Docker volume (Postgres) |
| Database passwords and the instance id               | `data/secrets/` in the repository folder  |
| Optional settings, such as ports and allowed origins | `infra/compose/.env`, if you create it    |

Everything stays on the machine that runs the stack. The `data/` folder and `infra/compose/.env` are git-ignored, so they are not committed to the repository.

Project rules forbid logging personal data or secrets, including in error messages ([security and privacy rules](../.claude/rules/security-privacy.md)). Logs go to the container output. No automated check enforces the logging rule yet; it is checked in review.

## Who can reach it

The web app (port 8080 by default) and the API (port 3000 by default) listen on all network interfaces, so other devices on your local network can reach them. The API accepts browser requests only from the origins listed in `OFFGRID_CORS_ORIGINS`. Anyone on your network who can reach the API can use it, so keep the network trusted, and keep the host account locked down. See [ADR 0015](adr/0015-no-reverse-proxy-cors-on-the-server.md).

Local access uses plain HTTP, so traffic on your local network is not encrypted.

## Backing up and exporting

- **Back up** with the commands in the [README](../README.md#back-up). The database dump holds your data. The copy of `data/` holds your secrets. Store both somewhere safe, outside the repository.
- **Export** as a feature, for example to a file you can read, is planned in the `export` module. It is not built yet. Until it is, the database dump is the way to get your data out.
- **Delete** by running `docker compose ... down -v`, which removes the database volume. Then delete `data/` to remove the secrets.

## What is not yet in place

- The egress-blocked stack check (`pnpm check:stack-egress`) that proves the stack works with no outbound network is planned. See [privacy-guards.md](privacy-guards.md).
- Encryption of the data at rest and of local traffic is not in place yet.
