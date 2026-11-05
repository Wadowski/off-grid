// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { recoveryAttempts } from "../../infrastructure/recovery-attempts/recovery-attempts.js";

export const clearRecoveryFailures = (email: string): void => {
  recoveryAttempts.delete(email);
};
