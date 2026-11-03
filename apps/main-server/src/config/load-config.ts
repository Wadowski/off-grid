// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ReadSecretFile, ServerConfig } from "../types.js";
import { readSecretFileUtf8 } from "./read-secret-file-utf8.js";
import { environmentSchema } from "./environment-schema.js";
import { ConfigError } from "./config-error.js";
import { readRequiredSecret } from "./read-required-secret.js";

export const loadConfig = (
  env: NodeJS.ProcessEnv = process.env,
  readSecretFile: ReadSecretFile = readSecretFileUtf8,
): ServerConfig => {
  const parsed = environmentSchema.safeParse(env);
  if (!parsed.success) {
    const problems = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new ConfigError(`invalid configuration: ${problems}`);
  }
  const values = parsed.data;

  return {
    http: { host: values.OFFGRID_HTTP_HOST, port: values.OFFGRID_HTTP_PORT },
    database: {
      host: values.OFFGRID_DATABASE_HOST,
      port: values.OFFGRID_DATABASE_PORT,
      name: values.OFFGRID_DATABASE_NAME,
      user: values.OFFGRID_DATABASE_USER,
      password: readRequiredSecret(
        "OFFGRID_DATABASE_PASSWORD_FILE",
        values.OFFGRID_DATABASE_PASSWORD_FILE,
        readSecretFile,
      ),
      poolMax: values.OFFGRID_DATABASE_POOL_MAX,
    },
    trustedProxies: values.OFFGRID_TRUSTED_PROXIES,
    corsOrigins: values.OFFGRID_CORS_ORIGINS,
    rateLimitPerMinute: values.OFFGRID_RATE_LIMIT_PER_MINUTE,
    logLevel: values.OFFGRID_LOG_LEVEL,
  };
};
