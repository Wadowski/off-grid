// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { revokeSession } from "../infrastructure/revoke-session.js";

export const endSession = async (
  db: ModuleDatabase,
  userId: string,
  sessionId: string,
): Promise<void> => {
  await db.$transaction(async (tx) => {
    await withUserContext(tx, userId);
    await revokeSession(tx, sessionId);
  });
};
