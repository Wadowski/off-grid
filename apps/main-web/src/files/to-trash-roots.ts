// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileListItem } from "./types.js";

export const toTrashRoots = (items: readonly FileListItem[]): readonly FileListItem[] => {
  const trashedIds = new Set(items.map((item) => item.id));
  return items.filter((item) => item.parentId === null || !trashedIds.has(item.parentId));
};
