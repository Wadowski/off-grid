# Updater

The updater is an app, not a module. It holds the only Docker socket in the stack (from OG-167 on) and has no module schema.

This package is the backup and restore core used before an update: it dumps the `offgrid` database and copies the secrets directory into a backup folder, verifies the dump, and restores a dump on demand.

## Layout

- `src/config/`: environment and secret file loading, validated with zod.
- `src/backup/`: naming, retention, dump, verification, secrets copy, restore and health wait.
- `src/types.ts` and `src/constants.ts`: shared types and constants.

## Configuration

| Variable | Default | Notes |
| --- | --- | --- |
| `OFFGRID_UPDATER_DATABASE_HOST` | required | Postgres host |
| `OFFGRID_UPDATER_DATABASE_PORT` | `5432` | |
| `OFFGRID_UPDATER_DATABASE_NAME` | `offgrid` | |
| `OFFGRID_UPDATER_DATABASE_USER` | `offgrid_migrator` | |
| `OFFGRID_UPDATER_MIGRATOR_PASSWORD_FILE` | required | File holding the migrator password |
| `OFFGRID_UPDATER_SECRETS_DIRECTORY` | `data/secrets` | `/run/secrets` in production |
| `OFFGRID_UPDATER_BACKUP_ROOT` | `data/backups` | `/backups` volume in production |
| `OFFGRID_UPDATER_BACKUP_RETENTION` | `3` | Newest backups kept, at least 1 |
| `OFFGRID_UPDATER_HEALTH_URL` | `http://127.0.0.1:3000/health` | http or https only |
| `OFFGRID_UPDATER_HEALTH_TIMEOUT_SECONDS` | `120` | |
