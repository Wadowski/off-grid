// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

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
  readonly healthTimeoutMilliseconds: number;
}
