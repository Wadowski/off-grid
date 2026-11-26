// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FolderPickerNode } from "./types.js";

export const toIsValidMoveTarget = (node: FolderPickerNode): boolean =>
  !node.disabled && !node.isCurrent;
