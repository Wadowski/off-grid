// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { INVITATION_ATTEMPT_POLICY } from "../../constants.js";
import { recordFailedRedemption } from "../../infrastructure/invitations/record-failed-redemption.js";

export const recordInvalidRedemption = async (
  db: ModuleDatabase,
  userId: string,
  now: Date,
): Promise<void> => {
  await db.$transaction(async (tx) => {
    await withUserContext(tx, userId);
    await recordFailedRedemption(tx, userId, INVITATION_ATTEMPT_POLICY, now);
  });
};
