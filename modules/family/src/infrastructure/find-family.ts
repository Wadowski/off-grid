// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { Family } from "../types.js";
import { toFamily } from "./to-family.js";

export const findFamily = async (
  tx: ModuleTransaction,
  familyId: string,
): Promise<Family | null> => {
  const record = await tx.family.findUnique({ where: { familyId } });
  return record === null ? null : toFamily(record);
};
