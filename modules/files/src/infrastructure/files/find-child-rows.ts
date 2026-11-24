// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { ChildRowsRequest, FileRecord } from "../../types.js";
import { toSortKeyField } from "../../domain/files/to-sort-key-field.js";
import { afterSortCursorCondition } from "./after-sort-cursor-condition.js";
import { toChildrenOrderBy } from "./to-children-order-by.js";
import { toFileRecord } from "./to-file-record.js";

export const findChildRows = async (
  tx: ModuleTransaction,
  input: ChildRowsRequest & { readonly isFolder: boolean },
): Promise<FileRecord[]> => {
  const field = toSortKeyField(input.sort, input.isFolder);
  const rows = await tx.filesFile.findMany({
    where: {
      driveId: input.driveId,
      parentId: input.parentId,
      deletedAt: null,
      isFolder: input.isFolder,
      ...(input.cursor === null ? {} : { AND: [afterSortCursorCondition(field, input.cursor)] }),
    },
    orderBy: toChildrenOrderBy(field, input.direction),
    take: input.take,
  });
  return rows.map(toFileRecord);
};
