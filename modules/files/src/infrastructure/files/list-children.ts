// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { ChildRowsRequest, FileRecord } from "../../types.js";
import { findChildRows } from "./find-child-rows.js";

export const listChildren = async (
  tx: ModuleTransaction,
  request: ChildRowsRequest,
): Promise<FileRecord[]> => {
  const folderCursor = request.cursor?.isFolder === true ? request.cursor : null;
  const fileCursor = request.cursor?.isFolder === false ? request.cursor : null;
  const folders =
    request.cursor === null || folderCursor !== null
      ? await findChildRows(tx, { ...request, cursor: folderCursor, isFolder: true })
      : [];
  const remaining = request.take - folders.length;
  const files =
    remaining > 0
      ? await findChildRows(tx, {
          ...request,
          cursor: fileCursor,
          take: remaining,
          isFolder: false,
        })
      : [];
  return [...folders, ...files];
};
