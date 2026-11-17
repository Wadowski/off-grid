// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { chmodSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { assertFilesDirectoryWritable } from "./assert-files-directory-writable.js";

const isRunningAsRoot = (): boolean => process.getuid?.() === 0;

const failureOf = async (promise: Promise<void>): Promise<string> => {
  try {
    await promise;
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
  return "";
};

describe("assertFilesDirectoryWritable", () => {
  let root: string;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "offgrid-files-"));
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });

  it("accepts a writable directory and leaves it empty", async () => {
    const directory = join(root, "files");
    mkdirSync(directory);

    await expect(assertFilesDirectoryWritable(directory)).resolves.toBeUndefined();
    expect(readdirSync(directory)).toEqual([]);
  });

  it("names the variable when the directory is missing", async () => {
    await expect(assertFilesDirectoryWritable(join(root, "absent"))).rejects.toThrow(
      "OFFGRID_FILES_DIRECTORY must name an existing directory",
    );
  });

  it("names the variable when the path is a file, without echoing its name", async () => {
    const file = join(root, "secret-note.txt");
    writeFileSync(file, "");

    const message = await failureOf(assertFilesDirectoryWritable(file));

    expect(message).toBe("OFFGRID_FILES_DIRECTORY must name a directory, not a file");
  });

  it.skipIf(isRunningAsRoot())("names the variable when the directory is read-only", async () => {
    const directory = join(root, "locked");
    mkdirSync(directory);
    chmodSync(directory, 0o500);

    try {
      await expect(assertFilesDirectoryWritable(directory)).rejects.toThrow(
        "OFFGRID_FILES_DIRECTORY must name a directory the server can write to",
      );
    } finally {
      chmodSync(directory, 0o700);
    }
  });
});
