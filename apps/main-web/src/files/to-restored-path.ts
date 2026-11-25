// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { toFolderPath } from "./to-folder-path.js";
import type { Drive, FileEntry } from "./types.js";

export const toRestoredPath = (driveId: Drive["id"], restored: FileEntry): string =>
  restored.parentId === null ? toFolderPath(driveId) : toFolderPath(driveId, restored.parentId);
