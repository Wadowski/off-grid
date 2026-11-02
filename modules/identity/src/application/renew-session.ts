// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import {
  ACCESS_TOKEN_BYTES,
  ACCESS_TOKEN_LIFETIME_MS,
  REFRESH_REUSE_GRACE_MS,
  REFRESH_TOKEN_BYTES,
} from "../constants.js";
import { digestToken } from "../infrastructure/digest-token.js";
import { findSessionByRefreshToken } from "../infrastructure/find-session-by-refresh-token.js";
import { generateSecretToken } from "../infrastructure/generate-secret-token.js";
import type { RenewedSession } from "../types.js";
import { endSession } from "./end-session.js";
import { saveSessionTokens } from "./save-session-tokens.js";
import { SessionEndedError } from "./session-ended-error.js";

export const renewSession = async (
  db: ModuleDatabase,
  refreshToken: string,
  now: Date = new Date(),
): Promise<RenewedSession> => {
  const presentedHash = digestToken(refreshToken);
  const session = await findSessionByRefreshToken(db, presentedHash);
  if (
    session === null ||
    session.revoked ||
    session.expiresAt <= now ||
    session.accountStatus !== "active"
  ) {
    throw new SessionEndedError();
  }
  const accessToken = generateSecretToken(ACCESS_TOKEN_BYTES);
  const accessExpiresAt = new Date(now.getTime() + ACCESS_TOKEN_LIFETIME_MS);
  const accessTokenHash = digestToken(accessToken);

  if (!session.matchedCurrent) {
    const replacedInGrace =
      session.rotatedAt !== null &&
      now.getTime() - session.rotatedAt.getTime() <= REFRESH_REUSE_GRACE_MS;
    if (!replacedInGrace) {
      await endSession(db, session.userId, session.sessionId);
      throw new SessionEndedError();
    }
    await saveSessionTokens(db, session, null, { accessTokenHash, accessExpiresAt });
    return {
      accessToken,
      accessExpiresAt,
      refreshToken: null,
      sessionExpiresAt: session.expiresAt,
    };
  }

  const nextRefreshToken = generateSecretToken(REFRESH_TOKEN_BYTES);
  const rotated = await saveSessionTokens(db, session, presentedHash, {
    refreshTokenHash: digestToken(nextRefreshToken),
    previousRefreshTokenHash: presentedHash,
    rotatedAt: now,
    accessTokenHash,
    accessExpiresAt,
  });
  if (!rotated) {
    // Another request rotated this token first. Look again, which now finds it in the grace window.
    return renewSession(db, refreshToken, now);
  }
  return {
    accessToken,
    accessExpiresAt,
    refreshToken: nextRefreshToken,
    sessionExpiresAt: session.expiresAt,
  };
};
