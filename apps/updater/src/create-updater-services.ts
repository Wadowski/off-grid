// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { applyUpdate } from "./apply/apply-update.js";
import { createBackupService } from "./apply/create-backup-service.js";
import { createFileStatusStore } from "./apply/create-file-status-store.js";
import { createDockerRunner } from "./docker/create-docker-runner.js";
import { readServerVersion } from "./docker/read-server-version.js";
import { createRunLock } from "./run/create-run-lock.js";
import { postgresTools } from "./backup/postgres-tools.js";
import { probeHealthUrl } from "./backup/probe-health-url.js";
import { systemClock } from "./backup/system-clock.js";
import type { ApplyDependencies, UpdaterConfig, UpdaterServices } from "./types.js";
import type { Logger } from "@offgrid/observability";

export const createUpdaterServices = (config: UpdaterConfig, logger: Logger): UpdaterServices => {
  const dockerContext = {
    socketPath: config.dockerSocket,
    project: config.composeProject,
    imageRegistry: config.imageRegistry,
  };
  const applyDependencies: ApplyDependencies = {
    docker: createDockerRunner(dockerContext),
    backup: createBackupService(
      postgresTools,
      {
        target: config.database,
        backupRoot: config.backupRoot,
        secretsDirectory: config.secretsDirectory,
        retention: config.backupRetention,
      },
      systemClock,
    ),
    statusStore: createFileStatusStore(config.statusFile),
    health: {
      server: () => probeHealthUrl(fetch, config.healthUrl),
      web: () => probeHealthUrl(fetch, config.webHealthUrl),
    },
    clock: systemClock,
    healthTimeoutMilliseconds: config.healthTimeoutMilliseconds,
  };
  return {
    apiToken: config.apiToken,
    statusFile: config.statusFile,
    releaseRepository: config.releaseRepository,
    releaseApiBaseUrl: config.releaseApiBaseUrl,
    runLock: createRunLock(),
    httpFetch: fetch,
    logger,
    currentVersion: () => readServerVersion(dockerContext),
    runApply: (request) => applyUpdate(applyDependencies, request),
  };
};
