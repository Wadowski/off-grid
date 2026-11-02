// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { digestToken } from "../infrastructure/digest-token.js";
import { setAccessTokenHash } from "../infrastructure/set-access-token-hash.js";
import type { VerifiedAccessToken } from "../types.js";

export const verifyAccessToken = (
  db: ModuleDatabase,
  accessToken: string,
  now: Date = new Date(),
): Promise<VerifiedAccessToken | null> =>
  db.$transaction(async (tx) => {
    const accessTokenHash = digestToken(accessToken);
    await setAccessTokenHash(tx, accessTokenHash);
    const session = await tx.session.findFirst({ where: { accessTokenHash } });
    if (
      session === null ||
      session.revoked ||
      session.expiresAt <= now ||
      session.accessExpiresAt === null ||
      session.accessExpiresAt <= now
    ) {
      return null;
    }
    await withUserContext(tx, session.userId);
    const account = await tx.userAccount.findUnique({
      where: { userId: session.userId },
      select: { status: true },
    });
    if (account?.status !== "active") {
      return null;
    }
    return { userId: session.userId, sessionId: session.sessionId };
  });
