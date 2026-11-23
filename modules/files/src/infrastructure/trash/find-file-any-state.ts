// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { FileRecord } from "../../types.js";
import { toFileRecord } from "../files/to-file-record.js";

export const findFileAnyState = async (
  tx: ModuleTransaction,
  fileId: string,
): Promise<FileRecord | null> => {
  const row = await tx.filesFile.findFirst({ where: { fileId } });
  return row === null ? null : toFileRecord(row);
};
