// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { StorageFixture } from "./types.js";

export const createTemporaryDirectory = (): Promise<string> =>
  mkdtemp(join(tmpdir(), "offgrid-files-"));

export const createStorageRoot = async (base: string): Promise<string> => {
  const root = join(base, "files");
  await mkdir(root);
  return root;
};

export const removeDirectory = (directory: string): Promise<void> =>
  rm(directory, { recursive: true, force: true });

export const fixtureAt = (base: string, storage: StorageFixture["storage"]): StorageFixture => ({
  storage,
  cleanup: () => removeDirectory(base),
});
