// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { listDriveChildren, listFileChildren } from "./files-api.js";
import type { FileListPage, FolderTarget } from "./types.js";

export const listFolderPage = (target: FolderTarget, cursor?: string): Promise<FileListPage> =>
  target.kind === "drive"
    ? listDriveChildren(target.driveId, { cursor })
    : listFileChildren(target.folderId, { cursor });
