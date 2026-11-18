// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import {
  DEFAULT_BACKUP_RETENTION,
  DEFAULT_BACKUP_ROOT,
  DEFAULT_DATABASE_NAME,
  DEFAULT_DATABASE_PORT,
  DEFAULT_DATABASE_USER,
  DEFAULT_HEALTH_TIMEOUT_SECONDS,
  DEFAULT_HEALTH_URL,
  DEFAULT_SECRETS_DIRECTORY,
  DEFAULT_STATUS_FILE,
  DEFAULT_WEB_HEALTH_URL,
} from "../constants.js";

const httpUrlSchema = z
  .url()
  .refine((value) => /^https?:\/\//.test(value), "must be an http or https URL");

const portSchema = z.coerce.number().int().min(1).max(65535);

const positiveIntegerSchema = z.coerce.number().int().min(1);

export const updaterEnvironmentSchema = z.object({
  OFFGRID_UPDATER_DATABASE_HOST: z.string().min(1),
  OFFGRID_UPDATER_DATABASE_PORT: portSchema.default(DEFAULT_DATABASE_PORT),
  OFFGRID_UPDATER_DATABASE_NAME: z.string().min(1).default(DEFAULT_DATABASE_NAME),
  OFFGRID_UPDATER_DATABASE_USER: z
    .string()
    .regex(/^[a-z][a-z0-9_]*$/)
    .default(DEFAULT_DATABASE_USER),
  OFFGRID_UPDATER_MIGRATOR_PASSWORD_FILE: z.string().min(1),
  OFFGRID_UPDATER_SECRETS_DIRECTORY: z.string().min(1).default(DEFAULT_SECRETS_DIRECTORY),
  OFFGRID_UPDATER_BACKUP_ROOT: z.string().min(1).default(DEFAULT_BACKUP_ROOT),
  OFFGRID_UPDATER_BACKUP_RETENTION: positiveIntegerSchema.default(DEFAULT_BACKUP_RETENTION),
  OFFGRID_UPDATER_HEALTH_URL: httpUrlSchema.default(DEFAULT_HEALTH_URL),
  OFFGRID_UPDATER_WEB_HEALTH_URL: httpUrlSchema.default(DEFAULT_WEB_HEALTH_URL),
  OFFGRID_UPDATER_STATUS_FILE: z.string().min(1).default(DEFAULT_STATUS_FILE),
  OFFGRID_UPDATER_HEALTH_TIMEOUT_SECONDS: positiveIntegerSchema.default(
    DEFAULT_HEALTH_TIMEOUT_SECONDS,
  ),
});
