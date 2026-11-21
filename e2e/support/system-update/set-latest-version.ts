// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { LATEST_VERSION_FILE } from "../release-source/constants.js";
import { releaseSourceDirectory } from "../release-source/release-source-directory.js";

export const setLatestVersion = (version: string): Promise<void> =>
  writeFile(join(releaseSourceDirectory(), LATEST_VERSION_FILE), version);
