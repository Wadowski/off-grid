// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { findLiveSessions } from "../../infrastructure/sessions/find-live-sessions.js";
import type { ListedSession } from "../../types.js";

export const listOwnSessions = async (
  db: ModuleDatabase,
  userId: string,
  currentSessionId: string,
  now: Date = new Date(),
): Promise<ListedSession[]> => {
  const sessions = await db.$transaction(async (tx) => {
    await withUserContext(tx, userId);
    return findLiveSessions(tx, userId, now);
  });
  return sessions.map((session) => ({
    id: session.sessionId,
    deviceLabel: session.deviceLabel,
    createdAt: session.createdAt.toISOString(),
    lastUsedAt: session.lastUsedAt.toISOString(),
    current: session.sessionId === currentSessionId,
  }));
};
