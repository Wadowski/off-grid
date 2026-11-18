// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const DEFAULT_BACKUP_RETENTION = 3;

export const DEFAULT_BACKUP_ROOT = "data/backups";

export const DEFAULT_SECRETS_DIRECTORY = "data/secrets";

export const DEFAULT_DATABASE_PORT = 5432;

export const DEFAULT_DATABASE_NAME = "offgrid";

export const DEFAULT_DATABASE_USER = "offgrid_migrator";

export const DEFAULT_HEALTH_URL = "http://127.0.0.1:3000/health";

export const DEFAULT_HEALTH_TIMEOUT_SECONDS = 120;

export const HEALTH_POLL_INTERVAL_MILLISECONDS = 1000;

export const HEALTH_REQUEST_TIMEOUT_MILLISECONDS = 5000;

export const BACKUP_FOLDER_MODE = 0o700;

export const SECRET_FILE_MODE = 0o600;

export const DUMP_FILE_NAME = "database.dump";

export const SECRETS_FOLDER_NAME = "secrets";

export const BACKUP_NAME_PATTERN = /^offgrid-(?<version>[0-9A-Za-z.+_-]+)-(?<stamp>\d{8}T\d{6}Z)$/;
