// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { BACKUP_FOLDER_MODE, SECRET_FILE_MODE } from "../constants.js";
import { SecretFileUnreadableError } from "./errors/secret-file-unreadable-error.js";

export const copySecrets = async (secretsDirectory: string, destination: string): Promise<void> => {
  await mkdir(destination, { mode: BACKUP_FOLDER_MODE });
  for (const fileName of await readdir(secretsDirectory)) {
    const source = join(secretsDirectory, fileName);
    const entry = await stat(source).catch(() => {
      throw new SecretFileUnreadableError(fileName);
    });
    if (!entry.isFile()) {
      continue;
    }
    const contents = await readFile(source).catch(() => {
      throw new SecretFileUnreadableError(fileName);
    });
    await writeFile(join(destination, fileName), contents, { mode: SECRET_FILE_MODE });
  }
};
