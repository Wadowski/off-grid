// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { renameFile } from "./files-api.js";
import type { FileEntry } from "./types.js";

export const renameEntry = (fileId: FileEntry["id"], name: string): Promise<FileEntry> =>
  renameFile(fileId, { name });
