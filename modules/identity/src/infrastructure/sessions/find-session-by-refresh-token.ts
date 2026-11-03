// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { z } from "zod";
import { ACCOUNT_STATUSES } from "../../constants.js";
import type { SessionLookup } from "../../types.js";
import { setRefreshTokenHash } from "./set-refresh-token-hash.js";

export const findSessionByRefreshToken = (
  db: ModuleDatabase,
  refreshTokenHash: string,
): Promise<SessionLookup | null> =>
  db.$transaction(async (tx) => {
    await setRefreshTokenHash(tx, refreshTokenHash);
    const session = await tx.session.findFirst({
      where: {
        OR: [{ refreshTokenHash }, { previousRefreshTokenHash: refreshTokenHash }],
      },
    });
    if (session === null) {
      return null;
    }
    await withUserContext(tx, session.userId);
    const account = await tx.userAccount.findUnique({
      where: { userId: session.userId },
      select: { status: true },
    });
    if (account === null) {
      return null;
    }
    return {
      sessionId: session.sessionId,
      userId: session.userId,
      expiresAt: session.expiresAt,
      revoked: session.revoked,
      rotatedAt: session.rotatedAt,
      matchedCurrent: session.refreshTokenHash === refreshTokenHash,
      accountStatus: z.enum(ACCOUNT_STATUSES).parse(account.status),
    };
  });
