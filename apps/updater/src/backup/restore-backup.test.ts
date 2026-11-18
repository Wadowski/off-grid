// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createFakeClock } from "../../test/fake-clock.js";
import { RestoreFailedError } from "./errors/restore-failed-error.js";
import { restoreBackup } from "./restore-backup.js";
import type { DatabaseTools, RestoreSettings } from "../types.js";

const TARGET = {
  host: "db.internal",
  port: 5432,
  database: "offgrid",
  user: "offgrid_migrator",
  password: "migrator-secret-value",
};

const NAME = "offgrid-1.4.0-20261117T194500Z";

let backupRoot: string;
let restoredFiles: string[];

const recordingTools = (failure?: Error): DatabaseTools => ({
  dump: async () => undefined,
  listDump: async () => undefined,
  restore: async (_target, dumpFile) => {
    if (failure !== undefined) {
      throw failure;
    }
    restoredFiles.push(dumpFile);
  },
});

const settings = (healthy: boolean, clock = createFakeClock()): RestoreSettings => ({
  target: TARGET,
  backupRoot,
  healthProbe: async () => healthy,
  clock,
  healthTimeoutMilliseconds: 5000,
});

const failureOf = async (promise: Promise<unknown>): Promise<RestoreFailedError> => {
  const outcome = await promise.then(
    () => undefined,
    (error: unknown) => error,
  );
  expect(outcome).toBeInstanceOf(RestoreFailedError);
  return outcome as RestoreFailedError;
};

beforeEach(async () => {
  backupRoot = await mkdtemp(join(tmpdir(), "offgrid-restore-"));
  restoredFiles = [];
  await mkdir(join(backupRoot, NAME));
  await writeFile(join(backupRoot, NAME, "database.dump"), "dump-bytes");
});

afterEach(async () => {
  await rm(backupRoot, { recursive: true, force: true });
});

describe("restoreBackup", () => {
  it("restores the named dump and waits for the server to be healthy", async () => {
    await restoreBackup(recordingTools(), settings(true), NAME);

    expect(restoredFiles).toEqual([join(backupRoot, NAME, "database.dump")]);
  });

  it("throws before touching the database for an unknown backup name", async () => {
    const failure = await failureOf(
      restoreBackup(recordingTools(), settings(true), "offgrid-9.9.9-20200101T000000Z"),
    );

    expect(failure.step).toBe("lookup");
    expect(restoredFiles).toEqual([]);
  });

  it("rejects a name that is not a backup folder name before any file access", async () => {
    const failure = await failureOf(restoreBackup(recordingTools(), settings(true), "../offgrid"));

    expect(failure.step).toBe("lookup");
    expect(restoredFiles).toEqual([]);
  });

  it("names the restore step when pg_restore fails", async () => {
    const failure = await failureOf(
      restoreBackup(
        recordingTools(new Error("pg_restore exited with code 1")),
        settings(true),
        NAME,
      ),
    );

    expect(failure.step).toBe("restore");
  });

  it("names the health step when the server does not become healthy in time", async () => {
    const clock = createFakeClock();

    const failure = await failureOf(restoreBackup(recordingTools(), settings(false, clock), NAME));

    expect(failure.step).toBe("health");
    expect(clock.elapsed()).toBe(5000);
  });
});
