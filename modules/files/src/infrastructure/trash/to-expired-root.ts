// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ExpiredRoot, ExpiredRootRow } from "../../types.js";
import { toFileRecord } from "../files/to-file-record.js";

export const toExpiredRoot = (row: ExpiredRootRow): ExpiredRoot => {
  if (row.deletedAt === null) {
    throw new Error("An expired trash root has no deletion time");
  }
  return {
    ...toFileRecord(row),
    deletedAt: row.deletedAt,
    ownerUserId: row.userId,
    ownerFamilyId: row.familyId,
  };
};
