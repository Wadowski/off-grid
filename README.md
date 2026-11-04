# Offgrid

A privacy-first, family-oriented, self-hosted app suite. The current scope is the local server only: one server process and one database, running on your own machine. At runtime nothing is sent to a cloud service, and there is no telemetry.

## Status

Early development. The stack starts, the database and module schemas are set up, and the `family` reference module has create and list routes. The shipped server has no sign-in yet: the identity module is an empty stub, so every request is anonymous and user-scoped routes return `UNAUTHENTICATED`. The family routes are exercised in tests with an injected identity. The other feature modules in [modules/](modules/README.md) are still stubs. Cloud, gateway, billing and tunnel features are future work and do not exist yet.

## Install

### Prerequisites

- Docker Engine with the Compose v2 plugin (`docker compose version` must work).
- About 2 GB of free disk space for images and the database.

### One command

From the repository root:

```bash
docker compose -f infra/compose/docker-compose.yml up -d --wait
```

The first run builds the images, generates the secrets, creates the database and runs the migration job. Later runs keep your data and secrets. The migration job applies migrations for the modules the server registers; none are registered yet, so it currently applies nothing.

The first build needs internet access: it pulls base images and installs npm packages. After the stack is running, it makes no outbound calls.

Open the web app at `http://localhost:8080`. The API listens on port 3000 of the same host. Both ports listen on all network interfaces.

To open the web app from another device, set `OFFGRID_CORS_ORIGINS` to the origin that device uses, for example `http://192.168.1.20:8080`, in `infra/compose/.env` and restart the stack. The server accepts browser requests only from the origins listed there. This is a browser rule, not an access control: it does not stop other clients.

### Where data and secrets live

- `data/secrets/` (in the repository root, git-ignored): the database passwords and the instance id. Files are created once and never regenerated. Keep this folder safe: losing it means losing access to the database. The files are readable by any user on this machine, so keep the host account itself locked down.
- The `offgrid-db` Docker volume: the PostgreSQL data.

If you ran an earlier stack that used Caddy, its `caddy-data` and `caddy-config` volumes are no longer used. Remove them with `docker volume rm` once the new stack runs.

Optional settings (`OFFGRID_WEB_PORT`, `OFFGRID_SERVER_PORT`, `OFFGRID_CORS_ORIGINS`, `OFFGRID_API_ORIGIN`, `TZ`, `OFFGRID_VERSION`) can be set in `infra/compose/.env`. The defaults work unchanged. To start from the placeholders, copy the repository-root `.env.example` to `infra/compose/.env`.

The published ports listen on all network interfaces, so other devices on your network can reach the instance.

### Back up

Write the backups outside the repository, so that they are never committed. Replace `<backup-dir>` with a folder such as `$HOME/offgrid-backup`:

```bash
docker compose -f infra/compose/docker-compose.yml exec -T db pg_dump -U postgres offgrid > <backup-dir>/offgrid.sql
cp -a data <backup-dir>/data
```

Store both outputs somewhere safe. The dump holds your data and the copy holds your secrets.

### Stop

```bash
docker compose -f infra/compose/docker-compose.yml down
```

This stops the containers and keeps the volumes and `data/`. Add `-v` only if you want to delete the database as well.

### Recover the admin

If the admin cannot sign in, run this on the server host. It creates a one-time reset code for the admin account. Give the code to the admin in person; it is shown once and expires after 24 hours:

```bash
docker compose -f infra/compose/docker-compose.yml exec server node --import tsx src/recover-admin.ts reset-password --email <admin-email>
```

If no active admin exists at all, create one. The command refuses while an active admin exists:

```bash
docker compose -f infra/compose/docker-compose.yml exec server node --import tsx src/recover-admin.ts create-admin --email <admin-email> --name "<display name>"
```

### Outgoing email

Email is optional. Offgrid uses it for emailed recovery codes and for notices about account changes. Until you set it up, the app works without email.

You need an email address that sends mail through Gmail, iCloud or Fastmail, and an app password for it. An app password is a separate password that a provider issues for one application, so Offgrid never sees your real password.

- **Gmail:** turn on 2-Step Verification in your Google Account under Security. Then open Security, App passwords, create one named Offgrid, and copy the 16-character password.
- **iCloud:** sign in at appleid.apple.com, open Sign-In and Security, choose App-Specific Passwords, and create one named Offgrid.
- **Fastmail:** open Settings, Privacy & Security, Integrations, and create a new app password with Mail (SMTP) access.

Outlook.com is not supported yet, because Microsoft is moving SMTP to a sign-in method that Offgrid does not have yet.

For any other mail server, enter its host, port and security (STARTTLS, TLS or none) and the username it expects.

Save the settings as the admin, then send a test email. A failed test says why: the provider did not accept the password, the server cannot be reached, or the message was refused.

## Develop

Requirements: Node.js 24.22.1 or newer and pnpm. This repository uses `pnpm` only; do not use npm or yarn.

```bash
pnpm install
pnpm build
pnpm typecheck
pnpm lint
pnpm test
```

`pnpm test` runs the unit and integration tests of every package and the repository scripts. The integration tests start their own throwaway Postgres in a container, so Docker must be running. The end-to-end suite runs with `pnpm e2e` (smoke tests: `pnpm e2e:smoke`). Its global setup starts the compose stack for the run.

To run the full set of checks that CI runs, see [CONTRIBUTING.md](CONTRIBUTING.md) and [docs/ci.md](docs/ci.md).

## Documentation

- [Architecture overview](docs/architecture/overview.md): how the server, modules, database and web app fit together.
- [Module boundaries](docs/architecture/boundaries.md): the rules that `pnpm check:boundaries` enforces.
- [Glossary](docs/glossary.md): the terms used in the code and in these docs.
- [Privacy statement](docs/privacy.md): what the local server stores, where, and what it never sends out.
- [Architecture decision records](docs/adr/README.md): why things are the way they are.
- [CONTRIBUTING.md](CONTRIBUTING.md): how to contribute, including the DCO sign-off.
