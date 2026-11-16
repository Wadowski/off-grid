// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { readFile } from "node:fs/promises";
import { parseConnectionFile } from "./parse-connection-file.js";
import { SHARED_DATABASE_FILE_ENV } from "./constants.js";
import type { SharedClusterConnection } from "./types.js";

export const readConnectionFile = async (): Promise<SharedClusterConnection | undefined> => {
  const path = process.env[SHARED_DATABASE_FILE_ENV];
  if (path === undefined || path === "") {
    return undefined;
  }
  return parseConnectionFile(await readFile(path, "utf8"));
};
