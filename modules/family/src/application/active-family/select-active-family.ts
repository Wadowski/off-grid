// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import type { ReadOutcome } from "@offgrid/access-control";
import { isMember } from "../../infrastructure/is-member.js";
import { upsertActiveFamily } from "../../infrastructure/active-family/upsert-active-family.js";
import type { ActiveFamily } from "../../types.js";

export const selectActiveFamily = async (
  db: ModuleDatabase,
  userId: string,
  sessionId: string,
  familyId: string,
): Promise<ReadOutcome<ActiveFamily>> =>
  db.$transaction(async (tx) => {
    await withUserContext(tx, userId);
    if (!(await isMember(tx, familyId, userId))) {
      return { outcome: "not-found" };
    }
    await upsertActiveFamily(tx, sessionId, userId, familyId);
    return { outcome: "found", value: { familyId } };
  });
