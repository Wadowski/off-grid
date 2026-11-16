// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CONNECTION_FILE_NAME } from "./constants.js";
import type { SharedClusterConnection } from "./types.js";

export const writeConnectionFile = async (connection: SharedClusterConnection): Promise<string> => {
  const directory = await mkdtemp(join(tmpdir(), "offgrid-test-db-"));
  const path = join(directory, CONNECTION_FILE_NAME);
  await writeFile(path, JSON.stringify(connection), { mode: 0o600 });
  return path;
};
