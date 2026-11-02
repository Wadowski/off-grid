// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { SESSION_LIFETIME_MS, REFRESH_TOKEN_BYTES } from "../constants.js";
import { digestToken } from "../infrastructure/digest-token.js";
import { generateSecretToken } from "../infrastructure/generate-secret-token.js";
import { insertSession } from "../infrastructure/insert-session.js";
import type { IssuedSession } from "../types.js";

export const issueSession = async (db: ModuleDatabase, userId: string): Promise<IssuedSession> => {
  const refreshToken = generateSecretToken(REFRESH_TOKEN_BYTES);
  const expiresAt = new Date(Date.now() + SESSION_LIFETIME_MS);
  await db.$transaction(async (tx) => {
    await withUserContext(tx, userId);
    await insertSession(tx, {
      id: randomUUID(),
      userId,
      deviceLabel: null,
      expiresAt,
      refreshTokenHash: digestToken(refreshToken),
    });
  });
  return { refreshToken, expiresAt };
};
