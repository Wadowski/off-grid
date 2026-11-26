// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileListItem } from "../../files/types.js";

export const toNextFocusId = (items: readonly FileListItem[], restoredId: string): string => {
  const index = items.findIndex((item) => item.id === restoredId);
  return items[index + 1]?.id ?? items[index - 1]?.id ?? "";
};
