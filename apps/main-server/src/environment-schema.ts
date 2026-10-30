// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
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
