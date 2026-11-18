// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { mkdir, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { pruneBackups } from "./prune-backups.js";

let root: string;

const makeBackup = async (name: string): Promise<void> => {
  await mkdir(join(root, name));
  await writeFile(join(root, name, "database.dump"), "dump");
};

const remaining = async (): Promise<string[]> => (await readdir(root)).sort();

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "offgrid-prune-"));
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

describe("pruneBackups", () => {
  it("removes the oldest backups by name timestamp and keeps foreign folders", async () => {
    await makeBackup("offgrid-1.3.0-20261101T000000Z");
    await makeBackup("offgrid-1.3.1-20261110T000000Z");
    await makeBackup("offgrid-1.4.0-20261117T194500Z");
    await mkdir(join(root, "not-a-backup"));

    await pruneBackups(root, 2, "offgrid-1.4.0-20261117T194500Z");

    expect(await remaining()).toEqual([
      "not-a-backup",
      "offgrid-1.3.1-20261110T000000Z",
      "offgrid-1.4.0-20261117T194500Z",
    ]);
  });

  it("does nothing when the backup root does not exist yet", async () => {
    await pruneBackups(join(root, "missing"), 3, "offgrid-1.4.0-20261117T194500Z");

    expect(await readdir(root)).toEqual([]);
  });
});
