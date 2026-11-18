// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Client } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startTestDatabase, type DatabaseTarget, type TestDatabase } from "@offgrid/test-db";
import { createFakeDockerRunner } from "../../test/fake-docker-runner.js";
import { DUMP_FILE_NAME } from "../constants.js";
import { createBackupService } from "./create-backup-service.js";
import { postgresTools } from "../backup/postgres-tools.js";
import { systemClock } from "../backup/system-clock.js";
import type { ApplyDependencies, BackupService, ImageReferences } from "../types.js";
import { applyUpdate } from "./apply-update.js";
import { createFileStatusStore } from "./create-file-status-store.js";
import { readUpdateStatus } from "./read-update-status.js";

const SEEDED_BEFORE = "row-before-backup";
const SEEDED_AFTER = "row-written-by-new-release";

const RUNNING_IMAGES: ImageReferences = {
  server: `ghcr.io/offgrid/offgrid-main-server@sha256:${"c".repeat(64)}`,
  web: `ghcr.io/offgrid/offgrid-main-web@sha256:${"d".repeat(64)}`,
};

const NEW_IMAGES: ImageReferences = {
  server: `ghcr.io/offgrid/offgrid-main-server@sha256:${"a".repeat(64)}`,
  web: `ghcr.io/offgrid/offgrid-main-web@sha256:${"b".repeat(64)}`,
};

const REQUEST = {
  currentVersion: "1.4.0",
  manifest: {
    schemaVersion: 1,
    version: "1.5.0",
    commit: "a".repeat(40),
    images: {
      server: { reference: NEW_IMAGES.server, platforms: ["linux/amd64"] },
      web: { reference: NEW_IMAGES.web, platforms: ["linux/amd64"] },
    },
    minimumPreviousVersion: "1.0.0",
  },
};

let database: TestDatabase | undefined;
let migrator: Client | undefined;
let root: string;
let backupRoot: string;
let statusFile: string;

const requireMigrator = (): Client => {
  if (migrator === undefined) {
    throw new Error("migrator connection is not open");
  }
  return migrator;
};

const requireDatabase = (): TestDatabase => {
  if (database === undefined) {
    throw new Error("test database is not started");
  }
  return database;
};

const connectAsMigrator = async (target: DatabaseTarget): Promise<Client> => {
  const client = new Client({
    host: target.host,
    port: target.port,
    database: target.database,
    user: target.user,
    password: target.password,
  });
  await client.connect();
  return client;
};

const writeProbeValue = async (note: string): Promise<void> => {
  await requireMigrator().query("update backup_probe set note = $1 where id = 1", [note]);
};

const readProbeValue = async (): Promise<string | undefined> => {
  const result = await requireMigrator().query<{ note: string }>(
    "select note from backup_probe where id = 1",
  );
  return result.rows[0]?.note;
};

const isNewReleaseRunning = (calls: readonly string[]): boolean =>
  calls.some((call) => call.startsWith("replace:")) &&
  !calls.some((call) => call.startsWith("start:"));

const buildDependencies = (
  calls: string[],
  backup: BackupService,
  newReleaseWrites: string,
): ApplyDependencies => ({
  docker: createFakeDockerRunner(calls, new Map(), RUNNING_IMAGES),
  backup,
  statusStore: createFileStatusStore(statusFile),
  health: {
    server: async () => {
      if (!isNewReleaseRunning(calls)) {
        return true;
      }
      await writeProbeValue(newReleaseWrites);
      return false;
    },
    web: async () => true,
  },
  clock: systemClock,
  healthTimeoutMilliseconds: 1000,
});

const realBackup = (): BackupService =>
  createBackupService(
    postgresTools,
    {
      target: requireDatabase().migratorTarget,
      backupRoot,
      secretsDirectory: join(root, "secrets"),
      retention: 3,
    },
    systemClock,
  );

beforeAll(async () => {
  root = await mkdtemp(join(tmpdir(), "offgrid-apply-it-"));
  database = await startTestDatabase();
  migrator = await connectAsMigrator(requireDatabase().migratorTarget);
  backupRoot = join(root, "backups");
  statusFile = join(root, "status", "status.json");
}, 120_000);

beforeEach(async () => {
  const client = requireMigrator();
  await client.query("drop table if exists backup_probe");
  await client.query("create table backup_probe (id integer primary key, note text not null)");
  await client.query("insert into backup_probe (id, note) values (1, $1)", [SEEDED_BEFORE]);
  await rm(backupRoot, { recursive: true, force: true });
  await rm(join(root, "secrets"), { recursive: true, force: true });
  await mkdir(join(root, "secrets"));
  await writeFile(
    join(root, "secrets", "migrator-password"),
    requireDatabase().migratorTarget.password,
    { mode: 0o444 },
  );
});

afterAll(async () => {
  await migrator?.end();
  await database?.stop();
  await rm(root, { recursive: true, force: true });
});

describe("applyUpdate against Postgres 17", () => {
  it("restores the dump and starts the previous images when health fails after replace", async () => {
    const calls: string[] = [];

    const status = await applyUpdate(buildDependencies(calls, realBackup(), SEEDED_AFTER), REQUEST);

    expect(status.outcome).toBe("rolled_back");
    expect(status.failedStep).toBe("health");
    expect(status.writesAfterBackupLost).toBe(true);
    expect(await readProbeValue()).toBe(SEEDED_BEFORE);
    expect(calls.slice(-2)).toEqual([
      "stop",
      `start:${RUNNING_IMAGES.server}|${RUNNING_IMAGES.web}`,
    ]);
    expect(await readUpdateStatus(statusFile)).toEqual(status);
  }, 120_000);

  it("ends failed_needs_admin when the backup dump cannot be restored", async () => {
    const calls: string[] = [];
    const corruptingBackup: BackupService = {
      create: async (version) => {
        const created = await realBackup().create(version);
        const dumpFile = join(backupRoot, created.name, DUMP_FILE_NAME);
        await rm(dumpFile, { force: true });
        await writeFile(dumpFile, "not a dump");
        return created;
      },
      restore: (name) => realBackup().restore(name),
    };

    const status = await applyUpdate(
      buildDependencies(calls, corruptingBackup, SEEDED_AFTER),
      REQUEST,
    );

    expect(status.outcome).toBe("failed_needs_admin");
    expect(status.failedStep).toBe("rollback_restore");
    expect(status.writesAfterBackupLost).toBe(false);
    expect(calls.some((call) => call.startsWith("start:"))).toBe(false);
    expect(await readProbeValue()).toBe(SEEDED_AFTER);
  }, 120_000);
});
