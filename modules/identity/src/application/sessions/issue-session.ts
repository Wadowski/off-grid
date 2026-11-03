// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import {
  ACCESS_TOKEN_BYTES,
  ACCESS_TOKEN_LIFETIME_MS,
  REFRESH_TOKEN_BYTES,
  SESSION_LIFETIME_MS,
} from "../../constants.js";
import { digestToken } from "../../infrastructure/tokens/digest-token.js";
import { generateSecretToken } from "../../infrastructure/tokens/generate-secret-token.js";
import { insertSession } from "../../infrastructure/sessions/insert-session.js";
import type { IssueSessionOptions, IssuedSession } from "../../types.js";

export const issueSession = async (
  db: ModuleDatabase,
  userId: string,
  options: IssueSessionOptions = {},
): Promise<IssuedSession> => {
  const refreshToken = generateSecretToken(REFRESH_TOKEN_BYTES);
  const accessToken = generateSecretToken(ACCESS_TOKEN_BYTES);
  const now = Date.now();
  const expiresAt = new Date(now + (options.lifetimeMs ?? SESSION_LIFETIME_MS));
  const accessExpiresAt = new Date(now + ACCESS_TOKEN_LIFETIME_MS);
  await db.$transaction(async (tx) => {
    await withUserContext(tx, userId);
    await insertSession(tx, {
      id: randomUUID(),
      userId,
      deviceLabel: options.deviceLabel ?? null,
      expiresAt,
      refreshTokenHash: digestToken(refreshToken),
      accessTokenHash: digestToken(accessToken),
      accessExpiresAt,
    });
  });
  return { refreshToken, expiresAt, accessToken, accessExpiresAt };
};
