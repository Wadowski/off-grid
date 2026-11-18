// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { mkdir, mkdtemp, readdir, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { STATUS_FILE_MODE } from "../constants.js";
import { createFileStatusStore } from "./create-file-status-store.js";
import { readUpdateStatus } from "./read-update-status.js";
import { updateStatusSchema } from "./update-status-schema.js";

const RUN_ID = "0b6f5a3e-2d4c-4f1a-9a8b-7c6d5e4f3a21";

const buildStatus = (outcome: "in_progress" | "succeeded") => ({
  runId: RUN_ID,
  currentVersion: "1.4.0",
  targetVersion: "1.5.0",
  startedAt: "2026-11-17T19:45:00.000Z",
  finishedAt: outcome === "succeeded" ? "2026-11-17T19:50:00.000Z" : null,
  outcome,
  failedStep: null,
  steps: [],
  backupName: null,
  previousImages: null,
  writesAfterBackupLost: false,
  message: "Update is running.",
});

let folder: string;
let statusFile: string;

beforeEach(async () => {
  folder = await mkdtemp(join(tmpdir(), "offgrid-status-"));
  statusFile = join(folder, "data", "status.json");
});

afterEach(async () => {
  await rm(folder, { recursive: true, force: true });
});

describe("createFileStatusStore", () => {
  it("writes a status that reads back unchanged", async () => {
    const store = createFileStatusStore(statusFile);
    const status = buildStatus("succeeded");

    await store.write(status);

    expect(await readUpdateStatus(statusFile)).toEqual(updateStatusSchema.parse(status));
  });

  it("replaces the previous status on each write", async () => {
    const store = createFileStatusStore(statusFile);

    await store.write(buildStatus("in_progress"));
    await store.write(buildStatus("succeeded"));

    expect((await readUpdateStatus(statusFile))?.outcome).toBe("succeeded");
  });

  it("stores the file with mode 0600", async () => {
    await createFileStatusStore(statusFile).write(buildStatus("in_progress"));

    expect((await stat(statusFile)).mode & 0o777).toBe(STATUS_FILE_MODE);
  });

  it("leaves no temporary file behind after a write", async () => {
    await createFileStatusStore(statusFile).write(buildStatus("in_progress"));

    expect(await readdir(join(folder, "data"))).toEqual(["status.json"]);
  });

  it("removes the temporary file when the final rename fails", async () => {
    await mkdir(statusFile, { recursive: true });

    await expect(
      createFileStatusStore(statusFile).write(buildStatus("in_progress")),
    ).rejects.toThrow();

    expect(await readdir(join(folder, "data"))).toEqual(["status.json"]);
    expect(await readdir(statusFile)).toEqual([]);
  });

  it("rejects a status that does not match the schema and writes nothing", async () => {
    const store = createFileStatusStore(statusFile);

    await expect(
      store.write({ ...buildStatus("in_progress"), outcome: "exploded" } as never),
    ).rejects.toThrow();

    expect(await readUpdateStatus(statusFile)).toBeNull();
  });
});
