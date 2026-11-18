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

export interface FakeEngineImage {
  readonly reference: string;
  readonly id: string;
  readonly repoDigests: readonly string[];
  readonly env: readonly string[];
}

export interface FakeEngineContainer {
  readonly name: string;
  readonly service: string;
  readonly image: string;
  readonly env: readonly string[];
  readonly running: boolean;
  readonly exitCode: number;
}

export interface FakeEngineOptions {
  readonly images: readonly FakeEngineImage[];
  readonly containers: readonly FakeEngineContainer[];
  readonly pullFails?: boolean;
  readonly initExitCode?: number;
}

export interface FakeEngineRequest {
  readonly method: string;
  readonly path: string;
  readonly body: unknown;
}

export interface FakeEngine {
  readonly socketPath: string;
  readonly requests: FakeEngineRequest[];
  readonly containerNames: () => string[];
  readonly containerNamed: (
    name: string,
  ) => { image: string; env: string[]; running: boolean } | undefined;
  readonly close: () => Promise<void>;
}

export interface FakeEngineContainerRecord {
  readonly id: string;
  name: string;
  image: string;
  config: Record<string, unknown>;
  env: string[];
  labels: Record<string, string>;
  running: boolean;
  exitCode: number;
}

export interface FakeEngineImageRecord {
  readonly id: string;
  readonly reference: string;
  readonly repoDigests: string[];
  readonly env: string[];
}

export interface FakeEngineReply {
  readonly status: number;
  readonly json?: unknown;
  readonly text?: string;
}
