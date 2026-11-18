// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { stat } from "node:fs/promises";
import { join } from "node:path";
import { DUMP_FILE_NAME } from "../constants.js";
import { RestoreFailedError } from "./errors/restore-failed-error.js";
import { parseBackupName } from "./parse-backup-name.js";

export const locateDumpFile = async (backupRoot: string, name: string): Promise<string> => {
  if (parseBackupName(name) === undefined) {
    throw new RestoreFailedError("lookup");
  }
  const dumpFile = join(backupRoot, name, DUMP_FILE_NAME);
  const isPresent = await stat(dumpFile).then(
    (entry) => entry.isFile(),
    () => false,
  );
  if (!isPresent) {
    throw new RestoreFailedError("lookup");
  }
  return dumpFile;
};
