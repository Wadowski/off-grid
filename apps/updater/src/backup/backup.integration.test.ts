// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readdir, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { Client } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startTestDatabase, type DatabaseTarget, type TestDatabase } from "@offgrid/test-db";
import { createBackup } from "./create-backup.js";
import { postgresTools } from "./postgres-tools.js";
import { restoreBackup } from "./restore-backup.js";
import { systemClock } from "./system-clock.js";
import type { BackupSettings, RestoreSettings } from "../types.js";

const run = promisify(execFile);

const REQUIRED_CLIENT_MAJOR = "17";
const SEEDED_BEFORE = "row-before-backup";
const SEEDED_AFTER = "row-after-backup";
const BACKUP_VERSION = "1.4.0";
const BASE_TIME = Date.parse("2026-11-17T19:45:00.000Z");

let database: TestDatabase | undefined;
let migrator: Client | undefined;
let root: string;
let backupRoot: string;
let secretsDirectory: string;

const requireClientTools = async (): Promise<void> => {
  for (const tool of ["pg_dump", "pg_restore"]) {
    const output = await run(tool, ["--version"]).then(
      (result) => result.stdout,
      () => {
        throw new Error(`${tool} must be on PATH for the backup integration test`);
      },
    );
    if (!output.includes(` ${REQUIRED_CLIENT_MAJOR}.`)) {
      throw new Error(`${tool} must be major version ${REQUIRED_CLIENT_MAJOR}: ${output.trim()}`);
    }
  }
};

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

const settings = (target: DatabaseTarget, retention: number): BackupSettings => ({
  target,
  backupRoot,
  secretsDirectory,
  retention,
});

const restoreSettings = (target: DatabaseTarget): RestoreSettings => ({
  target,
  backupRoot,
  healthProbe: async () => true,
  clock: systemClock,
  healthTimeoutMilliseconds: 5000,
});

const readProbeValue = async (): Promise<string | undefined> => {
  const result = await requireMigrator().query<{ note: string }>(
    "select note from backup_probe where id = 1",
  );
  return result.rows[0]?.note;
};

const writeProbeValue = async (note: string): Promise<void> => {
  await requireMigrator().query("update backup_probe set note = $1 where id = 1", [note]);
};

const modeOf = async (path: string): Promise<number> => (await stat(path)).mode & 0o777;

beforeAll(async () => {
  root = await mkdtemp(join(tmpdir(), "offgrid-backup-it-"));
  await requireClientTools();
  database = await startTestDatabase();
  migrator = await connectAsMigrator(requireDatabase().migratorTarget);
  backupRoot = join(root, "backups");
  secretsDirectory = join(root, "secrets");
  await mkdir(secretsDirectory);
  await writeFile(
    join(secretsDirectory, "migrator-password"),
    requireDatabase().migratorTarget.password,
    { mode: 0o444 },
  );
});

beforeEach(async () => {
  await migrator.query("drop table if exists backup_probe");
  await migrator.query("create table backup_probe (id integer primary key, note text not null)");
  await migrator.query("insert into backup_probe (id, note) values (1, $1)", [SEEDED_BEFORE]);
  await rm(backupRoot, { recursive: true, force: true });
});

afterAll(async () => {
  await migrator?.end();
  await database?.stop();
  await rm(root, { recursive: true, force: true });
});

describe("backup and restore against Postgres 17", () => {
  it("restores the database row that existed when the backup was taken", async () => {
    const backup = await createBackup(
      postgresTools,
      settings(requireDatabase().migratorTarget, 3),
      {
        version: BACKUP_VERSION,
        createdAt: new Date(BASE_TIME),
      },
    );
    await writeProbeValue(SEEDED_AFTER);

    await restoreBackup(
      postgresTools,
      restoreSettings(requireDatabase().migratorTarget),
      backup.name,
    );

    expect(await readProbeValue()).toBe(SEEDED_BEFORE);
  });

  it("creates the backup folder with mode 0700 and a dump that lists", async () => {
    const backup = await createBackup(
      postgresTools,
      settings(requireDatabase().migratorTarget, 3),
      {
        version: BACKUP_VERSION,
        createdAt: new Date(BASE_TIME),
      },
    );

    expect(await modeOf(backup.path)).toBe(0o700);
    expect(await modeOf(join(backup.path, "database.dump"))).toBeGreaterThan(0);
    await expect(
      postgresTools.listDump(join(backup.path, "database.dump")),
    ).resolves.toBeUndefined();
  });

  it("keeps the newest backups and prunes the oldest when a fourth one is taken", async () => {
    const first = await createBackup(postgresTools, settings(requireDatabase().migratorTarget, 3), {
      version: BACKUP_VERSION,
      createdAt: new Date(BASE_TIME),
    });
    for (const offset of [1000, 2000, 3000]) {
      await createBackup(postgresTools, settings(requireDatabase().migratorTarget, 3), {
        version: BACKUP_VERSION,
        createdAt: new Date(BASE_TIME + offset),
      });
    }

    const remaining = (await readdir(backupRoot)).sort();

    expect(remaining).toHaveLength(3);
    expect(remaining).not.toContain(first.name);
  });

  it("refuses to restore a backup name that does not exist", async () => {
    await expect(
      restoreBackup(
        postgresTools,
        restoreSettings(requireDatabase().migratorTarget),
        "offgrid-1.4.0-20200101T000000Z",
      ),
    ).rejects.toMatchObject({ name: "RestoreFailedError", step: "lookup" });
    expect(await readProbeValue()).toBe(SEEDED_BEFORE);
  });
});
