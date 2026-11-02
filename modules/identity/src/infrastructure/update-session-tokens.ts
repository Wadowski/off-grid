// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { SessionTokenUpdate } from "../types.js";

export const updateSessionTokens = async (
  tx: ModuleTransaction,
  sessionId: string,
  expectedRefreshTokenHash: string | null,
  update: SessionTokenUpdate,
): Promise<boolean> => {
  const { count } = await tx.session.updateMany({
    where: {
      sessionId,
      revoked: false,
      ...(expectedRefreshTokenHash === null ? {} : { refreshTokenHash: expectedRefreshTokenHash }),
    },
    data: {
      refreshTokenHash: update.refreshTokenHash,
      previousRefreshTokenHash: update.previousRefreshTokenHash,
      rotatedAt: update.rotatedAt,
      accessTokenHash: update.accessTokenHash,
      accessExpiresAt: update.accessExpiresAt,
    },
  });
  return count === 1;
};
