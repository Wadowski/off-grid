// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { updateSessionTokens } from "../infrastructure/update-session-tokens.js";
import type { SessionLookup, SessionTokenUpdate } from "../types.js";

export const saveSessionTokens = (
  db: ModuleDatabase,
  session: SessionLookup,
  expectedRefreshTokenHash: string | null,
  update: SessionTokenUpdate,
): Promise<boolean> =>
  db.$transaction(async (tx) => {
    await withUserContext(tx, session.userId);
    return updateSessionTokens(tx, session.sessionId, expectedRefreshTokenHash, update);
  });
