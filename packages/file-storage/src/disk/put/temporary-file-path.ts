// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomBytes } from "node:crypto";
import { join } from "node:path";
import { STORAGE_TEMP_DIRECTORY_NAME } from "../../constants.js";

export const temporaryFilePath = (directory: string): string =>
  join(directory, STORAGE_TEMP_DIRECTORY_NAME, `${randomBytes(16).toString("hex")}.part`);
