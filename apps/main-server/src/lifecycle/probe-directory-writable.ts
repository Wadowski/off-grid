// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

const PROBE_FILE_PREFIX = ".offgrid-write-probe-";

export const probeDirectoryWritable = async (directory: string): Promise<boolean> => {
  const probePath = join(directory, `${PROBE_FILE_PREFIX}${randomUUID()}`);
  try {
    await writeFile(probePath, "", { flag: "wx" });
  } catch {
    return false;
  }
  await rm(probePath, { force: true });
  return true;
};
