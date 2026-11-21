// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { appendFile } from "node:fs/promises";
import { join } from "node:path";
import { REQUEST_LOG_FILE } from "./constants.js";
import type { ReleaseRequestLogEntry } from "./types.js";

export const logReleaseRequest = async (
  directory: string,
  entry: ReleaseRequestLogEntry,
): Promise<void> => {
  await appendFile(join(directory, REQUEST_LOG_FILE), `${JSON.stringify(entry)}\n`);
};
