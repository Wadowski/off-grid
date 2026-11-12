// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { isHttpOrigin } from "./is-http-origin.js";
import { isIpOrCidr } from "./is-ip-or-cidr.js";
import { parseCommaSeparated } from "./parse-comma-separated.js";
import { portSchema } from "./port-schema.js";

export const environmentSchema = z.object({
  OFFGRID_HTTP_HOST: z.string().min(1).default("127.0.0.1"),
  OFFGRID_HTTP_PORT: portSchema.default(3000),
  OFFGRID_DATABASE_HOST: z.string().min(1),
  OFFGRID_DATABASE_PORT: portSchema.default(5432),
  OFFGRID_DATABASE_NAME: z.string().min(1),
  OFFGRID_DATABASE_USER: z
    .string()
    .regex(/^[a-z][a-z0-9_]*$/)
    .default("offgrid_app"),
  OFFGRID_DATABASE_PASSWORD_FILE: z.string().min(1),
  OFFGRID_MAIL_ENCRYPTION_KEY_FILE: z.string().min(1),
  OFFGRID_DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(100).default(10),
  OFFGRID_TRUSTED_PROXIES: z
    .string()
    .default("")
    .transform(parseCommaSeparated)
    .pipe(z.array(z.string().refine(isIpOrCidr, "must be an IP address or CIDR range"))),
  OFFGRID_CORS_ORIGINS: z
    .string()
    .default("")
    .transform(parseCommaSeparated)
    .pipe(z.array(z.string().refine(isHttpOrigin, "must be an http or https origin with no path"))),
  OFFGRID_RATE_LIMIT_PER_MINUTE: z.coerce.number().int().min(1).default(300),
  OFFGRID_OUTBOX_RETENTION_DAYS: z.coerce.number().int().min(1).max(3650).default(7),
  OFFGRID_LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});
