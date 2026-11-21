// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { LATEST_VERSION_FILE } from "./constants.js";

export const readLatestVersion = async (directory: string): Promise<string> =>
  (await readFile(join(directory, LATEST_VERSION_FILE), "utf8")).trim();
