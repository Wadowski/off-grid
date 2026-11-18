// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { z } from "zod";
import type { releaseManifestSchema } from "@offgrid/contracts";
import type { updateStatusSchema } from "./apply/update-status-schema.js";
import type {
  FORWARD_STEP_NAMES,
  ROLLBACK_STEP_NAMES,
  UPDATE_OUTCOMES,
  UPDATE_STEP_NAMES,
  UPDATE_STEP_STATES,
} from "./constants.js";

export interface DatabaseTarget {
  readonly host: string;
  readonly port: number;
  readonly database: string;
  readonly user: string;
  readonly password: string;
}

export interface DatabaseTools {
  readonly dump: (target: DatabaseTarget, dumpFile: string) => Promise<void>;
  readonly listDump: (dumpFile: string) => Promise<void>;
  readonly restore: (target: DatabaseTarget, dumpFile: string) => Promise<void>;
}

export interface BackupDescriptor {
  readonly name: string;
  readonly version: string;
  readonly createdAt: Date;
  readonly path: string;
  readonly pruneWarning?: string;
}

export interface ParsedBackupName {
  readonly name: string;
  readonly version: string;
  readonly stamp: string;
}

export interface BackupSettings {
  readonly target: DatabaseTarget;
  readonly backupRoot: string;
  readonly secretsDirectory: string;
  readonly retention: number;
}

export interface BackupRequest {
  readonly version: string;
  readonly createdAt: Date;
}

export interface Clock {
  readonly now: () => number;
  readonly sleep: (milliseconds: number) => Promise<void>;
}

export type HealthProbe = () => Promise<boolean>;

export interface RestoreSettings {
  readonly target: DatabaseTarget;
  readonly backupRoot: string;
  readonly healthProbe: HealthProbe;
  readonly clock: Clock;
  readonly healthTimeoutMilliseconds: number;
}

export type ReadSecretFile = (path: string) => string;

export interface UpdaterConfig {
  readonly database: DatabaseTarget;
  readonly secretsDirectory: string;
  readonly backupRoot: string;
  readonly backupRetention: number;
  readonly healthUrl: string;
  readonly webHealthUrl: string;
  readonly healthTimeoutMilliseconds: number;
  readonly statusFile: string;
}

export type ReleaseManifest = z.infer<typeof releaseManifestSchema>;

export type UpdateStepName = (typeof UPDATE_STEP_NAMES)[number];

export type ForwardStepName = (typeof FORWARD_STEP_NAMES)[number];

export type RollbackStepName = (typeof ROLLBACK_STEP_NAMES)[number];

export type UpdateStepState = (typeof UPDATE_STEP_STATES)[number];

export type UpdateOutcome = (typeof UPDATE_OUTCOMES)[number];

export type UpdateStatus = z.infer<typeof updateStatusSchema>;

export type UpdateStep = UpdateStatus["steps"][number];

export interface ImageReferences {
  readonly server: string;
  readonly web: string;
}

export interface DockerRunner {
  readonly inspectRunningImages: () => Promise<ImageReferences>;
  readonly pullImage: (reference: string) => Promise<void>;
  readonly runInitJob: (serverImage: string) => Promise<void>;
  readonly replaceContainers: (images: ImageReferences) => Promise<void>;
  readonly stopContainers: () => Promise<void>;
  readonly startContainers: (images: ImageReferences) => Promise<void>;
}

export interface BackupService {
  readonly create: (version: string) => Promise<{ readonly name: string }>;
  readonly restore: (name: string) => Promise<void>;
}

export interface StatusStore {
  readonly write: (status: UpdateStatus) => Promise<void>;
}

export interface HealthProbes {
  readonly server: HealthProbe;
  readonly web: HealthProbe;
}

export interface ApplyDependencies {
  readonly docker: DockerRunner;
  readonly backup: BackupService;
  readonly statusStore: StatusStore;
  readonly health: HealthProbes;
  readonly clock: Clock;
  readonly healthTimeoutMilliseconds: number;
}

export interface ApplyRequest {
  readonly currentVersion: string;
  readonly manifest: unknown;
}

export interface ParsedApplyRequest {
  readonly currentVersion: string;
  readonly manifest: ReleaseManifest;
}

export interface UpdateRun {
  readonly dependencies: ApplyDependencies;
  readonly manifest: ReleaseManifest;
  status: UpdateStatus;
}
