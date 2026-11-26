// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { TRASH_PAGE_LIMIT } from "./constants.js";
import { listDriveTrash } from "./files-api.js";
import type { Drive, FileListItem } from "./types.js";

export const readAllTrashPages = async (driveId: Drive["id"]): Promise<readonly FileListItem[]> => {
  const items: FileListItem[] = [];
  let cursor: string | null = null;
  do {
    const page = await listDriveTrash(
      driveId,
      cursor === null ? { limit: TRASH_PAGE_LIMIT } : { limit: TRASH_PAGE_LIMIT, cursor },
    );
    items.push(...page.items);
    cursor = page.nextCursor;
  } while (cursor !== null);
  return items;
};
