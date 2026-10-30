// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { isIpOrCidr } from "./is-ip-or-cidr.js";
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
  OFFGRID_TRUSTED_PROXIES: z
    .string()
    .default("")
    .transform((value) =>
      value
        .split(",")
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0),
    )
    .pipe(z.array(z.string().refine(isIpOrCidr, "must be an IP address or CIDR range"))),
  OFFGRID_RATE_LIMIT_PER_MINUTE: z.coerce.number().int().min(1).default(300),
  OFFGRID_LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});
