// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { BACKUP_FOLDER_MODE, SECRET_FILE_MODE } from "../constants.js";

export const copySecrets = async (secretsDirectory: string, destination: string): Promise<void> => {
  await mkdir(destination, { mode: BACKUP_FOLDER_MODE });
  const entries = await readdir(secretsDirectory, { withFileTypes: true });
  for (const entry of entries.filter((candidate) => candidate.isFile())) {
    const contents = await readFile(join(secretsDirectory, entry.name));
    await writeFile(join(destination, entry.name), contents, { mode: SECRET_FILE_MODE });
  }
};
