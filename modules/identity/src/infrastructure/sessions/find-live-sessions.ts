// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { LiveSessionRecord } from "../../types.js";

export const findLiveSessions = (
  tx: ModuleTransaction,
  userId: string,
  now: Date,
): Promise<LiveSessionRecord[]> =>
  tx.session.findMany({
    where: { userId, revoked: false, expiresAt: { gt: now } },
    select: { sessionId: true, deviceLabel: true, createdAt: true, lastUsedAt: true },
    orderBy: { lastUsedAt: "desc" },
  });
