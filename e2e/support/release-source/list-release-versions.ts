// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { RELEASES_FOLDER } from "./constants.js";

export const listReleaseVersions = async (directory: string): Promise<string[]> =>
  (await readdir(join(directory, RELEASES_FOLDER))).sort((left, right) =>
    left.localeCompare(right, undefined, { numeric: true }),
  );
