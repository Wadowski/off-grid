// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import {
  DEFAULT_BACKUP_RETENTION,
  DEFAULT_DOCKER_SOCKET,
  DEFAULT_HTTP_HOST,
  DEFAULT_HTTP_PORT,
  DEFAULT_BACKUP_ROOT,
  DEFAULT_COMPOSE_PROJECT,
  DEFAULT_NIGHTLY_TIME,
  DEFAULT_RELEASE_API_BASE_URL,
  DEFAULT_DATABASE_NAME,
  DEFAULT_DATABASE_PORT,
  DEFAULT_DATABASE_USER,
  DEFAULT_HEALTH_TIMEOUT_SECONDS,
  DEFAULT_HEALTH_URL,
  DEFAULT_SECRETS_DIRECTORY,
  DEFAULT_SERVER_URL,
  DEFAULT_STATUS_FILE,
  DEFAULT_WEB_HEALTH_URL,
  NIGHTLY_TIME_PATTERN,
} from "../constants.js";

const httpUrlSchema = z
  .url()
  .refine((value) => /^https?:\/\//.test(value), "must be an http or https URL");

const httpsUrlSchema = z
  .url()
  .refine((value) => value.startsWith("https://"), "must be an https URL")
  .transform((value) => value.replace(/\/+$/, ""));

const portSchema = z.coerce.number().int().min(1).max(65535);

const releaseRepositorySchema = z
  .string()
  .regex(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/, "must be owner/name");

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
  OFFGRID_UPDATER_TOKEN_FILE: z.string().min(1),
  OFFGRID_UPDATER_HTTP_HOST: z.string().min(1).default(DEFAULT_HTTP_HOST),
  OFFGRID_UPDATER_HTTP_PORT: portSchema.default(DEFAULT_HTTP_PORT),
  OFFGRID_UPDATER_RELEASE_REPOSITORY: releaseRepositorySchema,
  OFFGRID_UPDATER_RELEASE_API_BASE_URL: httpsUrlSchema.default(DEFAULT_RELEASE_API_BASE_URL),
  OFFGRID_UPDATER_DOCKER_SOCKET: z.string().min(1).default(DEFAULT_DOCKER_SOCKET),
  OFFGRID_UPDATER_COMPOSE_PROJECT: z.string().min(1).default(DEFAULT_COMPOSE_PROJECT),
  OFFGRID_UPDATER_HEALTH_TIMEOUT_SECONDS: positiveIntegerSchema.default(
    DEFAULT_HEALTH_TIMEOUT_SECONDS,
  ),
  OFFGRID_UPDATER_SERVER_URL: httpUrlSchema.default(DEFAULT_SERVER_URL),
  OFFGRID_UPDATER_NIGHTLY_TIME: z
    .string()
    .regex(NIGHTLY_TIME_PATTERN, "must be HH:MM, 00:00 to 23:59")
    .default(DEFAULT_NIGHTLY_TIME),
});
