// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { encodeCursor } from "../../domain/files/encode-cursor.js";
import type { ListedChildren } from "../../types.js";
import { toFile } from "./to-file.js";

export const toFileList = (listed: ListedChildren) => ({
  items: listed.page.records.map(toFile),
  breadcrumbs: listed.breadcrumbs,
  nextCursor: listed.page.nextCursor === null ? null : encodeCursor(listed.page.nextCursor),
});
