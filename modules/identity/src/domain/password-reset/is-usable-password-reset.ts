// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { PasswordResetRecord } from "../../types.js";

export const isUsablePasswordReset = (reset: PasswordResetRecord, now: Date): boolean =>
  reset.usedAt === null && reset.retiredAt === null && reset.expiresAt > now;
