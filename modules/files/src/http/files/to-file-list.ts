// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { encodeCursor } from "../../domain/files/encode-cursor.js";
import type { ListedChildren } from "../../types.js";
import { toFileListItem } from "./to-file-list-item.js";

export const toFileList = (listed: ListedChildren) => ({
  items: listed.page.records.map((record) => toFileListItem(record, listed.itemCounts)),
  breadcrumbs: listed.breadcrumbs,
  nextCursor: listed.page.nextCursor === null ? null : encodeCursor(listed.page.nextCursor),
});
