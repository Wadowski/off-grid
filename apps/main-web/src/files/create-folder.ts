// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createFolder as createFolderRequest } from "./files-api.js";
import type { Drive, FileEntry } from "./types.js";

export const createFolder = (
  driveId: Drive["id"],
  parentId: FileEntry["id"] | null,
  name: string,
): Promise<FileEntry> => createFolderRequest(driveId, { parentId, name });
