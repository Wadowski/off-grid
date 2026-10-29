// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { readFileSync } from "node:fs";
import { z } from "zod";
import type { ReadSecretFile, ServerConfig } from "./types.js";

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

const portSchema = z.coerce.number().int().min(1).max(65535);

const LOOPBACK_HOSTS: ReadonlySet<string> = new Set(["127.0.0.1", "::1", "localhost"]);

const environmentSchema = z.object({
  OFFGRID_HTTP_HOST: z.string().min(1).default("127.0.0.1"),
  OFFGRID_HTTP_PORT: portSchema.default(3000),
  OFFGRID_DATABASE_HOST: z.string().min(1),
  OFFGRID_DATABASE_PORT: portSchema.default(5432),
  OFFGRID_DATABASE_NAME: z.string().min(1),
  OFFGRID_DATABASE_USER: z
    .string()
    .regex(/^[a-z][a-z0-9_]*$/)
    .default("outbox_app"),
  OFFGRID_DATABASE_PASSWORD_FILE: z.string().min(1),
  OFFGRID_DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(100).default(10),
  OFFGRID_DEV_IDENTITY: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  OFFGRID_RATE_LIMIT_PER_MINUTE: z.coerce.number().int().min(1).default(300),
  OFFGRID_LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

const readSecretFileUtf8: ReadSecretFile = (path) => readFileSync(path, "utf8");

export function loadConfig(
  env: NodeJS.ProcessEnv = process.env,
  readSecretFile: ReadSecretFile = readSecretFileUtf8,
): ServerConfig {
  const parsed = environmentSchema.safeParse(env);
  if (!parsed.success) {
    const problems = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new ConfigError(`invalid configuration: ${problems}`);
  }
  const values = parsed.data;
  if (values.OFFGRID_DEV_IDENTITY && !LOOPBACK_HOSTS.has(values.OFFGRID_HTTP_HOST)) {
    throw new ConfigError(
      "OFFGRID_DEV_IDENTITY=true is only allowed when OFFGRID_HTTP_HOST is a loopback address",
    );
  }

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
    devIdentity: values.OFFGRID_DEV_IDENTITY,
    rateLimitPerMinute: values.OFFGRID_RATE_LIMIT_PER_MINUTE,
    logLevel: values.OFFGRID_LOG_LEVEL,
  };
}

function readRequiredSecret(
  variableName: string,
  secretPath: string,
  readSecretFile: ReadSecretFile,
): string {
  let contents: string;
  try {
    contents = readSecretFile(secretPath).trim();
  } catch {
    throw new ConfigError(`secret file named by ${variableName} cannot be read`);
  }
  if (contents.length === 0) {
    throw new ConfigError(`secret file named by ${variableName} is empty`);
  }
  return contents;
}
