// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { FamilyMember } from "../types.js";
import { listAccountNames } from "./account-names/list-account-names.js";
import { toFamilyMember } from "./to-family-member.js";

export const listMembers = async (
  tx: ModuleTransaction,
  familyId: string,
): Promise<FamilyMember[]> => {
  const records = await tx.familyMember.findMany({
    where: { familyId },
    orderBy: [{ joinedAt: "asc" }, { userId: "asc" }],
  });
  const names = await listAccountNames(
    tx,
    records.map((record) => record.userId),
  );
  return records.map((record) => toFamilyMember(record, names.get(record.userId) ?? null));
};
