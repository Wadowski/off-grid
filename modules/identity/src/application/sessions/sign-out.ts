// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import { digestToken } from "../../infrastructure/tokens/digest-token.js";
import { findSessionByRefreshToken } from "../../infrastructure/sessions/find-session-by-refresh-token.js";
import { endSession } from "./end-session.js";

export const signOut = async (db: ModuleDatabase, refreshToken: string): Promise<void> => {
  const session = await findSessionByRefreshToken(db, digestToken(refreshToken));
  if (session === null || session.revoked) {
    return;
  }
  await endSession(db, session.userId, session.sessionId);
};
