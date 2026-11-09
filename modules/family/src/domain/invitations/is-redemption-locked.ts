// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const isRedemptionLocked = (lockedUntil: Date | null, now: Date): boolean =>
  lockedUntil !== null && lockedUntil > now;
