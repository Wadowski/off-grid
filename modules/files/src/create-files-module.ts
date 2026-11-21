// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createDiskFileStorage } from "@offgrid/file-storage";
import type { FastifyInstance } from "fastify";
import { createStorageIntegritySweepWorker } from "./workers/storage-integrity-sweep/create-storage-integrity-sweep-worker.js";
import { registerFilesRoutes } from "./http/files/register-files-routes.js";
import { registerFamilyMembershipSubscribers } from "./events/family-membership/register-family-membership-subscribers.js";
import { registerDriveSubscribers } from "./events/drives/register-drive-subscribers.js";
import { STORAGE_SWEEP_FIRST_RUN_DELAY_MS, STORAGE_SWEEP_INTERVAL_MS } from "./constants.js";
import type {
  FilesModuleOptions,
  FilesRouteContext,
  FilesSubscriberContext,
  FilesWorkerContext,
} from "./types.js";

export const createFilesModule = (options: FilesModuleOptions) => {
  const storage = createDiskFileStorage(options.directory);
  return {
    name: "files",
    registerRoutes: (
      api: FastifyInstance,
      context: Pick<FilesRouteContext, "db" | "currentUserId">,
    ) =>
      registerFilesRoutes(api, {
        db: context.db,
        currentUserId: context.currentUserId,
        storage,
        maxUploadBytes: options.maxUploadBytes,
      }),
    registerSubscribers: (context: FilesSubscriberContext) => {
      registerFamilyMembershipSubscribers(context);
      registerDriveSubscribers(context);
    },
    workers: (context: FilesWorkerContext) => [
      createStorageIntegritySweepWorker({
        db: context.db,
        storage,
        logger: context.logger,
        now: () => new Date(),
        intervalMs: STORAGE_SWEEP_INTERVAL_MS,
        firstRunDelayMs: STORAGE_SWEEP_FIRST_RUN_DELAY_MS,
      }),
    ],
  };
};
