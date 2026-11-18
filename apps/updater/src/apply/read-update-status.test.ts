// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { StatusFileCorruptError } from "./errors/status-file-corrupt-error.js";
import { readUpdateStatus } from "./read-update-status.js";

let folder: string;
let statusFile: string;

beforeEach(async () => {
  folder = await mkdtemp(join(tmpdir(), "offgrid-read-status-"));
  statusFile = join(folder, "status.json");
});

afterEach(async () => {
  await rm(folder, { recursive: true, force: true });
});

describe("readUpdateStatus", () => {
  it("returns null when no update has run", async () => {
    expect(await readUpdateStatus(statusFile)).toBeNull();
  });

  it("fails when the file does not match the status schema", async () => {
    await writeFile(statusFile, JSON.stringify({ outcome: "in_progress" }));

    await expect(readUpdateStatus(statusFile)).rejects.toThrow();
  });

  it("fails with StatusFileCorruptError when the file is not JSON", async () => {
    await writeFile(statusFile, "not json");

    await expect(readUpdateStatus(statusFile)).rejects.toBeInstanceOf(StatusFileCorruptError);
  });
});
