# Privacy statement

This page says, in plain language, what the local Offgrid server does with your data and what it does not do. The technical checks behind these statements are described in [privacy-guards.md](privacy-guards.md).

## What it does not do

- **Nothing leaves the machine at runtime.** The server and the web app run on your own host. Once the stack is running, it makes no outbound network calls, with one exception. If you turn on outgoing mail, the server sends mail only to the mail server that you configure, such as Gmail, iCloud, Fastmail or a server on your own network. Mail is off by default, and the mail content goes to that provider. The first build needs internet access to pull base images and install npm packages.
- **No telemetry.** There are no analytics, tracking or crash-reporting SDKs, and no usage data is collected. `pnpm check:no-telemetry` runs in CI and fails the build if one is added. It scans for known packages and hosts only; the no-usage-data rule is a project policy that review enforces.
- **No accounts with third parties.** Offgrid does not sign you in with an outside identity provider, and it does not need an account with anyone to run.

Sign-in is planned to send traffic over plain HTTP on your local network. Anyone on the same network segment can read passwords and session tokens in that traffic. See [ADR 0016](adr/0016-local-authentication-model.md) for the decision and its trade-offs.

## Sign-in is not built yet

The shipped server has no sign-in. The identity module is an empty stub, so every request is anonymous. User-scoped routes refuse such requests with `UNAUTHENTICATED`. This means the server does not yet separate one user's data from another's on a real request. Until sign-in exists, treat the instance as a single-user installation on a network you trust.

## What it stores, and where

| What                                                 | Where                                     |
| ---------------------------------------------------- | ----------------------------------------- |
| Your data (families, memberships, and later modules) | The `offgrid-db` Docker volume (Postgres) |
| Database passwords and the instance id               | `data/secrets/` in the repository folder  |
| Optional settings, such as ports and allowed origins | `infra/compose/.env`, if you create it    |

Everything stays on the machine that runs the stack. The `data/` folder and `infra/compose/.env` are git-ignored, so they are not committed to the repository.

The secret files in `data/secrets/` are readable by every user on the machine, as the [README](../README.md#where-data-and-secrets-live) explains. Keep the host account locked down.

Project rules forbid logging personal data or secrets, including in error messages ([security and privacy rules](../.claude/rules/security-privacy.md)). The logger redacts fields whose names contain sensitive words. It does not redact free text in messages, so the rule relies on code review as well. Logs go to the container output.

## Who can reach it

The web app (port 8080 by default) and the API (port 3000 by default) listen on all network interfaces, so other devices on your local network can reach them. CORS settings in `OFFGRID_CORS_ORIGINS` only tell browsers which origins may read responses. They are not an access control, and they do not stop other clients. Anyone on your network who can reach the API can send it requests, so keep the network trusted. See [ADR 0015](adr/0015-no-reverse-proxy-cors-on-the-server.md).

Local access uses plain HTTP, so traffic on your local network is not encrypted.

## Backing up and exporting

- **Back up** with the commands in the [README](../README.md#back-up). The database dump holds your data. The copy of `data/` holds your secrets. Store both somewhere safe, outside the repository.
- **Export** as a feature, for example to a file you can read, is planned in the `export` module. It is not built yet. Until it is, the database dump is the way to get your data out.
- **Delete** by running `docker compose -f infra/compose/docker-compose.yml down -v`, which removes the database volume. Then delete `data/` to remove the secrets.

## What is not yet in place

- Sign-in and per-user access on real requests (see above).
- Encryption of the data at rest and of local traffic is not in place yet.
