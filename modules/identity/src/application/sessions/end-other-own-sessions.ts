// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { revokeOtherSessions } from "../../infrastructure/sessions/revoke-other-sessions.js";

export const endOtherOwnSessions = (
  db: ModuleDatabase,
  userId: string,
  currentSessionId: string,
): Promise<void> =>
  db.$transaction(async (tx) => {
    await withUserContext(tx, userId);
    await revokeOtherSessions(tx, userId, currentSessionId);
  });
