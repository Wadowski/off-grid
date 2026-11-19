// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import type {
  systemUpdateErrorCodeSchema,
  UPDATE_RUN_STATES,
  updateStatusSchema,
  updaterCheckSchema,
  systemUpdateApplyResultSchema,
} from "@offgrid/contracts";
import type { FastifyRequest } from "fastify";
import type { z } from "zod";

export interface SystemVersionOptions {
  readonly version: string;
  readonly commit?: string;
}

export interface UpdaterSettings {
  readonly url: string;
  readonly token: string;
}

export interface SystemModuleOptions extends SystemVersionOptions {
  readonly updater: UpdaterSettings | null;
}

export interface SystemModuleContext {
  readonly db: ModuleDatabase;
  readonly currentUserId: (request: FastifyRequest) => string | null;
  readonly isInstanceAdmin: (userId: string) => Promise<boolean>;
}

export type UpdateStatus = z.infer<typeof updateStatusSchema>;

export type UpdateRunState = (typeof UPDATE_RUN_STATES)[number];

export type UpdaterCheck = z.infer<typeof updaterCheckSchema>;

export type UpdateApplyResult = z.infer<typeof systemUpdateApplyResultSchema>;

export type UpdateErrorCode = z.infer<typeof systemUpdateErrorCodeSchema>;

export interface UpdaterStatusReply {
  readonly update: UpdateStatus | null;
  readonly running: boolean;
}

export interface UpdaterClient {
  readStatus(): Promise<UpdaterStatusReply>;
  checkForUpdate(): Promise<UpdaterCheck>;
  applyUpdate(version: string): Promise<UpdateApplyResult>;
}

export type Fetcher = typeof fetch;

export interface UpdaterRequest {
  readonly method: "GET" | "POST";
  readonly path: "/status" | "/check" | "/apply";
  readonly body?: unknown;
}

export interface UpdateSettingsRow {
  readonly nightlyEnabled: boolean;
  readonly latestVersion: string | null;
  readonly updateAvailable: boolean | null;
  readonly updateAllowed: boolean | null;
  readonly checkedAt: Date | null;
}

export interface UpdateCheckRecord {
  readonly latestVersion: string;
  readonly updateAvailable: boolean;
  readonly updateAllowed: boolean;
  readonly checkedAt: Date;
}

export interface UpdateDependencies {
  readonly db: ModuleDatabase;
  readonly updater: UpdaterClient;
  readonly isInstanceAdmin: (userId: string) => Promise<boolean>;
  readonly currentVersion: string;
}
