// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { moveFile } from "./files-api.js";
import type { FileEntry, MoveFileResult, MoveTarget } from "./types.js";

export const moveEntry = (fileId: FileEntry["id"], target: MoveTarget): Promise<MoveFileResult> =>
  moveFile(fileId, { driveId: target.driveId, parentId: target.parentId });
