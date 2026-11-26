// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { getFileVersionContent } from "./files-api.js";
import { saveBlob } from "./save-blob.js";
import type { FileEntry, FileVersion } from "./types.js";

export const downloadFileVersion = async (
  fileId: FileEntry["id"],
  versionId: FileVersion["id"],
  fileName: string,
): Promise<void> => {
  const content = await getFileVersionContent(fileId, versionId);
  saveBlob(content, fileName);
};
