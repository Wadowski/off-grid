// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { DUMP_FILE_NAME } from "../constants.js";
import type { Clock, DatabaseTools } from "../types.js";
import { createBackupService } from "./create-backup-service.js";

const TARGET = {
  host: "db.internal",
  port: 5432,
  database: "offgrid",
  user: "offgrid_migrator",
  password: "migrator-secret-value",
};

const CREATED_AT = Date.parse("2026-11-17T19:45:00.000Z");
const BACKUP_NAME = "offgrid-1.4.0-20261117T194500Z";

const fixedClock: Clock = {
  now: () => CREATED_AT,
  sleep: async () => undefined,
};

let folder: string;
let backupRoot: string;
let secretsDirectory: string;
let restoredDumps: string[];

const recordingTools = (): DatabaseTools => ({
  dump: async (_target, dumpFile) => {
    await writeFile(dumpFile, "dump-bytes");
  },
  listDump: async () => undefined,
  restore: async (_target, dumpFile) => {
    restoredDumps.push(dumpFile);
  },
});

const buildService = () =>
  createBackupService(
    recordingTools(),
    { target: TARGET, backupRoot, secretsDirectory, retention: 3 },
    fixedClock,
  );

beforeEach(async () => {
  folder = await mkdtemp(join(tmpdir(), "offgrid-backup-service-"));
  backupRoot = join(folder, "backups");
  secretsDirectory = join(folder, "secrets");
  restoredDumps = [];
  await mkdir(backupRoot);
  await mkdir(secretsDirectory);
});

afterEach(async () => {
  await rm(folder, { recursive: true, force: true });
});

describe("createBackupService", () => {
  it("creates a backup named by the version and the clock time", async () => {
    expect(await buildService().create("1.4.0")).toEqual({ name: BACKUP_NAME });
  });

  it("restores the database from the named backup", async () => {
    await mkdir(join(backupRoot, BACKUP_NAME));
    await writeFile(join(backupRoot, BACKUP_NAME, DUMP_FILE_NAME), "dump-bytes");

    await buildService().restore(BACKUP_NAME);

    expect(restoredDumps).toEqual([join(backupRoot, BACKUP_NAME, DUMP_FILE_NAME)]);
  });
});
