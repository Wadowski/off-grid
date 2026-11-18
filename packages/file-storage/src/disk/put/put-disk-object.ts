// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { STORAGE_TEMP_DIRECTORY_NAME } from "../../constants.js";
import type { PutOptions, StoredObject } from "../../types.js";
import { commitTempFile } from "./commit-temp-file.js";
import { removeTempFile } from "./remove-temp-file.js";
import { temporaryFilePath } from "./temporary-file-path.js";
import { writeStreamToTempFile } from "./write-stream-to-temp-file.js";

export const putDiskObject = async (
  directory: string,
  source: AsyncIterable<Uint8Array>,
  options: PutOptions = {},
): Promise<StoredObject> => {
  await mkdir(join(directory, STORAGE_TEMP_DIRECTORY_NAME), { recursive: true });
  const tempPath = temporaryFilePath(directory);
  try {
    const written = await writeStreamToTempFile(tempPath, source, options.signal);
    const key = await commitTempFile(directory, tempPath);
    return { key, ...written };
  } catch (error) {
    await removeTempFile(tempPath);
    throw error;
  }
};
