// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { REQUEST_LOG_FILE } from "./constants.js";
import type { ReleaseRequestLogEntry } from "./types.js";

export const readReleaseRequestLog = async (
  directory: string,
): Promise<ReleaseRequestLogEntry[]> => {
  const text = await readFile(join(directory, REQUEST_LOG_FILE), "utf8").catch(() => "");
  return text
    .split("\n")
    .filter((line) => line !== "")
    .map((line) => JSON.parse(line) as ReleaseRequestLogEntry);
};
