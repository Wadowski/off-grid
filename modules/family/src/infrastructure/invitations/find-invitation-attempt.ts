// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const findInvitationAttempt = (
  tx: ModuleTransaction,
  userId: string,
): Promise<{ readonly lockedUntil: Date | null } | null> =>
  tx.familyInvitationAttempt.findUnique({
    where: { userId },
    select: { lockedUntil: true },
  });
