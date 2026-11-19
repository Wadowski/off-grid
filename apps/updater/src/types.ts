// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { z } from "zod";
import type { Logger } from "@offgrid/observability";
import type {
  releaseManifestSchema,
  updateStatusSchema,
  UPDATE_OUTCOMES,
  UPDATE_STEP_NAMES,
  UPDATE_STEP_STATES,
} from "@offgrid/contracts";
import type {
  containerInspectSchema,
  containerSummarySchema,
  imageInspectSchema,
} from "./docker/engine-schemas.js";

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
  readonly httpHost: string;
  readonly httpPort: number;
  readonly apiToken: string;
  readonly releaseRepository: string;
  readonly dockerSocket: string;
  readonly composeProject: string;
}

export type ReleaseManifest = z.infer<typeof releaseManifestSchema>;

export type UpdateStepName = (typeof UPDATE_STEP_NAMES)[number];

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

export type ReleaseRun = () => void;

export interface RunLock {
  readonly tryAcquire: () => ReleaseRun | null;
  readonly isHeld: () => boolean;
}

export type HttpFetch = (url: string, init: RequestInit) => Promise<Response>;

export interface UpdateCheck {
  readonly currentVersion: string;
  readonly latestVersion: string;
  readonly updateAvailable: boolean;
  readonly updateAllowed: boolean;
}

export interface DockerContext {
  readonly socketPath: string;
  readonly project: string;
}

export interface EngineResponse {
  readonly status: number;
  readonly text: string;
}

export interface EngineRequestOptions {
  readonly operation: string;
  readonly body?: unknown;
  readonly acceptedStatuses?: readonly number[];
}

export type ContainerSummary = z.infer<typeof containerSummarySchema>;

export type ContainerInspect = z.infer<typeof containerInspectSchema>;

export type ImageInspect = z.infer<typeof imageInspectSchema>;

export interface UpdaterServices {
  readonly apiToken: string;
  readonly statusFile: string;
  readonly releaseRepository: string;
  readonly runLock: RunLock;
  readonly httpFetch: HttpFetch;
  readonly logger: Logger;
  readonly currentVersion: () => Promise<string>;
  readonly runApply: (request: ApplyRequest) => Promise<UpdateStatus>;
}

export interface ReleaseContext {
  readonly ok: true;
  readonly currentVersion: string;
  readonly manifest: ReleaseManifest;
}

export interface ReleaseContextFailure {
  readonly ok: false;
  readonly statusCode: 502 | 503;
  readonly error: "current_version_unknown" | "release_source_unreachable";
}
