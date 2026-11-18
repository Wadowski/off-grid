// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ApplyDependencies, DockerRunner, UpdateStatus } from "../src/types.js";

export type FakeDockerMethod = keyof DockerRunner;

export type HealthMode = "healthy" | "never" | "server-until-rollback" | "web-until-rollback";

export interface BackupFailures {
  readonly create?: boolean;
  readonly restore?: boolean;
}

export interface HarnessOptions {
  readonly failingMethods?: ReadonlyMap<FakeDockerMethod, Error>;
  readonly backupFailures?: BackupFailures;
  readonly health?: HealthMode;
  readonly statusWriteFailure?: (status: UpdateStatus) => boolean;
}

export interface Harness {
  readonly dependencies: ApplyDependencies;
  readonly calls: string[];
  readonly writes: UpdateStatus[];
}
