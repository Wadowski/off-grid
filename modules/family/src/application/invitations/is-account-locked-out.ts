// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { isRedemptionLocked } from "../../domain/invitations/is-redemption-locked.js";
import { findInvitationAttempt } from "../../infrastructure/invitations/find-invitation-attempt.js";

export const isAccountLockedOut = (
  db: ModuleDatabase,
  userId: string,
  now: Date,
): Promise<boolean> =>
  db.$transaction(async (tx) => {
    await withUserContext(tx, userId);
    const attempt = await findInvitationAttempt(tx, userId);
    return isRedemptionLocked(attempt?.lockedUntil ?? null, now);
  });
