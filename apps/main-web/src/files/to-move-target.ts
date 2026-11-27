// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FolderPickerNode, MoveTarget } from "./types.js";

export const toMoveTarget = (node: FolderPickerNode): MoveTarget => ({
  driveId: node.driveId,
  parentId: node.folderId,
});
