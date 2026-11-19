// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ChildrenCursor } from "../../types.js";

export const encodeCursor = (cursor: ChildrenCursor): string =>
  Buffer.from(
    JSON.stringify({ isFolder: cursor.isFolder, name: cursor.name, fileId: cursor.fileId }),
  ).toString("base64url");
