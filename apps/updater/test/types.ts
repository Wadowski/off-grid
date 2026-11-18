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
  readonly failingMethods?: ReadonlySet<FakeDockerMethod>;
  readonly backupFailures?: BackupFailures;
  readonly health?: HealthMode;
}

export interface Harness {
  readonly dependencies: ApplyDependencies;
  readonly calls: string[];
  readonly writes: UpdateStatus[];
}
