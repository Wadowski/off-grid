// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ReadSecretFile, UpdaterConfig } from "../types.js";
import { ConfigError } from "./config-error.js";
import { readRequiredSecret } from "./read-required-secret.js";
import { readSecretFileUtf8 } from "./read-secret-file-utf8.js";
import { updaterEnvironmentSchema } from "./updater-config-schema.js";

const MILLISECONDS_PER_SECOND = 1000;

export const loadUpdaterConfig = (
  env: NodeJS.ProcessEnv = process.env,
  readSecretFile: ReadSecretFile = readSecretFileUtf8,
): UpdaterConfig => {
  const parsed = updaterEnvironmentSchema.safeParse(env);
  if (!parsed.success) {
    const problems = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new ConfigError(`invalid configuration: ${problems}`);
  }
  const values = parsed.data;

  return {
    database: {
      host: values.OFFGRID_UPDATER_DATABASE_HOST,
      port: values.OFFGRID_UPDATER_DATABASE_PORT,
      database: values.OFFGRID_UPDATER_DATABASE_NAME,
      user: values.OFFGRID_UPDATER_DATABASE_USER,
      password: readRequiredSecret(
        "OFFGRID_UPDATER_MIGRATOR_PASSWORD_FILE",
        values.OFFGRID_UPDATER_MIGRATOR_PASSWORD_FILE,
        readSecretFile,
      ),
    },
    secretsDirectory: values.OFFGRID_UPDATER_SECRETS_DIRECTORY,
    backupRoot: values.OFFGRID_UPDATER_BACKUP_ROOT,
    backupRetention: values.OFFGRID_UPDATER_BACKUP_RETENTION,
    healthUrl: values.OFFGRID_UPDATER_HEALTH_URL,
    healthTimeoutMilliseconds:
      values.OFFGRID_UPDATER_HEALTH_TIMEOUT_SECONDS * MILLISECONDS_PER_SECOND,
  };
};
