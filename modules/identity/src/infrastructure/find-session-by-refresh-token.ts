// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import type { SessionLookup, SessionLookupRow } from "../types.js";

export const findSessionByRefreshToken = async (
  db: ModuleDatabase,
  refreshTokenHash: string,
): Promise<SessionLookup | null> => {
  const rows = await db.$queryRaw<SessionLookupRow[]>`
    SELECT session_id, user_id, expires_at, revoked, rotated_at, matched_current, account_status
    FROM identity.find_session_by_refresh_token(${refreshTokenHash})
  `;
  const [row] = rows;
  if (row === undefined) {
    return null;
  }
  return {
    sessionId: row.session_id,
    userId: row.user_id,
    expiresAt: row.expires_at,
    revoked: row.revoked,
    rotatedAt: row.rotated_at,
    matchedCurrent: row.matched_current,
    accountStatus: row.account_status as SessionLookup["accountStatus"],
  };
};
