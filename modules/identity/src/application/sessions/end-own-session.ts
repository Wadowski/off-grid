// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { revokeOwnedSession } from "../../infrastructure/sessions/revoke-owned-session.js";
import { SessionNotFoundError } from "../errors/session-not-found-error.js";

export const endOwnSession = (
  db: ModuleDatabase,
  userId: string,
  sessionId: string,
): Promise<void> =>
  db.$transaction(async (tx) => {
    await withUserContext(tx, userId);
    if (!(await revokeOwnedSession(tx, userId, sessionId))) {
      throw new SessionNotFoundError();
    }
  });
