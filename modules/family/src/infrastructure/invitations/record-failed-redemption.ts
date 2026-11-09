// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import { lockoutEndFor } from "../../domain/invitations/lockout-end-for.js";
import type { AttemptPolicy } from "../../types.js";

export const recordFailedRedemption = async (
  tx: ModuleTransaction,
  userId: string,
  policy: AttemptPolicy,
  now: Date,
): Promise<void> => {
  const attempt = await tx.familyInvitationAttempt.upsert({
    where: { userId },
    create: { userId, failures: 1, updatedAt: now },
    update: { failures: { increment: 1 }, updatedAt: now },
  });
  const lockedUntil = lockoutEndFor(attempt.failures, policy, now);
  if (lockedUntil !== null) {
    await tx.familyInvitationAttempt.update({
      where: { userId },
      data: { failures: 0, lockedUntil, updatedAt: now },
    });
  }
};
