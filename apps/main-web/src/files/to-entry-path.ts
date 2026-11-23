// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { toFileDetailsPath } from "./to-file-details-path.js";
import { toFolderPath } from "./to-folder-path.js";
import type { Drive, FileListItem } from "./types.js";

export const toEntryPath = (driveId: Drive["id"], item: FileListItem): string =>
  item.isFolder ? toFolderPath(driveId, item.id) : toFileDetailsPath(driveId, item.id);
