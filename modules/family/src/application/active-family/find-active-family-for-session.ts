// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { findActiveFamilyId } from "../../infrastructure/active-family/find-active-family-id.js";
import { isMember } from "../../infrastructure/is-member.js";

export const findActiveFamilyForSession = async (
  db: ModuleDatabase,
  userId: string,
  sessionId: string,
): Promise<string | null> =>
  db.$transaction(async (tx) => {
    await withUserContext(tx, userId);
    const familyId = await findActiveFamilyId(tx, sessionId);
    if (familyId === null || !(await isMember(tx, familyId, userId))) {
      return null;
    }
    return familyId;
  });
