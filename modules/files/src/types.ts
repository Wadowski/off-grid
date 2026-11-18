// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileStorage } from "@offgrid/file-storage";
import type { ModuleDatabase } from "@offgrid/db";
import type { Logger } from "@offgrid/observability";

export interface StorageIntegrityReport {
  readonly orphanKeys: readonly string[];
  readonly missingKeys: readonly string[];
  readonly orphanCount: number;
  readonly missingCount: number;
  readonly checkedRowCount: number;
  readonly checkedObjectCount: number;
}

export interface FilesModuleOptions {
  readonly directory: string;
}

export interface FilesWorkerContext {
  readonly db: ModuleDatabase;
  readonly logger: Logger;
}

export interface FilesWorker {
  readonly name: string;
  start(): Promise<void>;
  stop(): Promise<void>;
}

export interface StorageIntegritySweepOptions {
  readonly db: ModuleDatabase;
  readonly storage: FileStorage;
  readonly logger: Logger;
  readonly now: () => Date;
  readonly intervalMs: number;
  readonly firstRunDelayMs: number;
}
