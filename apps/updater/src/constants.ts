// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const DEFAULT_BACKUP_RETENTION = 3;

export const DEFAULT_BACKUP_ROOT = "data/backups";

export const DEFAULT_SECRETS_DIRECTORY = "data/secrets";

export const DEFAULT_DATABASE_PORT = 5432;

export const DEFAULT_DATABASE_NAME = "offgrid";

export const DEFAULT_DATABASE_USER = "offgrid_migrator";

export const DEFAULT_HEALTH_URL = "http://127.0.0.1:3000/api/health";

export const DEFAULT_WEB_HEALTH_URL = "http://127.0.0.1:8080/";

export const DEFAULT_STATUS_FILE = "data/updater/status.json";

export const DEFAULT_HTTP_HOST = "0.0.0.0";

export const DEFAULT_HTTP_PORT = 3100;

export const DEFAULT_DOCKER_SOCKET = "/var/run/docker.sock";

export const DEFAULT_COMPOSE_PROJECT = "offgrid";

export const DEFAULT_HEALTH_TIMEOUT_SECONDS = 120;

export const HEALTH_POLL_INTERVAL_MILLISECONDS = 1000;

export const HEALTH_REQUEST_TIMEOUT_MILLISECONDS = 5000;

export const BACKUP_FOLDER_MODE = 0o700;

export const SECRET_FILE_MODE = 0o600;

export const DUMP_FILE_NAME = "database.dump";

export const SECRETS_FOLDER_NAME = "secrets";

export const BACKUP_NAME_PATTERN = /^offgrid-(?<version>[0-9A-Za-z.+_-]+)-(?<stamp>\d{8}T\d{6}Z)$/;

export const MILLISECONDS_PER_SECOND = 1000;

export const STDERR_TAIL_BYTES = 2000;

export const FORWARD_STEP_NAMES = [
  "verify_version",
  "backup",
  "pull",
  "migrate",
  "replace",
  "health",
] as const;

export const ROLLBACK_STEP_NAMES = [
  "rollback_stop",
  "rollback_restore",
  "rollback_start",
  "rollback_health",
] as const;

export const UPDATE_STEP_NAMES = [...FORWARD_STEP_NAMES, ...ROLLBACK_STEP_NAMES] as const;

export const UPDATE_STEP_STATES = ["pending", "running", "succeeded", "failed", "skipped"] as const;

export const UPDATE_OUTCOMES = [
  "in_progress",
  "succeeded",
  "refused",
  "failed_before_change",
  "rolled_back",
  "failed_needs_admin",
] as const;

export const STATUS_FILE_MODE = 0o600;

export const STATUS_DIRECTORY_MODE = 0o700;

export const UPDATE_OUTCOME_MESSAGES = {
  in_progress: "Update is running.",
  succeeded: "Update finished and the new version is healthy.",
  refused: "Update was refused before any change was made.",
  failed_before_change: "Update stopped before any change was made.",
  rolled_back:
    "Update failed and the previous version was restored. Changes made after the backup were lost.",
  failed_needs_admin:
    "Update failed and the automatic rollback did not finish. Restore by hand as described in the updater README.",
} as const;
