// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { RECOVERY_FAILURE_LIMIT, RECOVERY_LOCKOUT_MS } from "../../constants.js";
import { recoveryAttempts } from "../../infrastructure/recovery-attempts/recovery-attempts.js";

export const recordRecoveryFailure = (email: string, now: number): void => {
  const failures = (recoveryAttempts.get(email)?.failures ?? 0) + 1;
  const lockedUntil = failures >= RECOVERY_FAILURE_LIMIT ? now + RECOVERY_LOCKOUT_MS : 0;
  recoveryAttempts.set(email, { failures: lockedUntil > 0 ? 0 : failures, lockedUntil });
};
