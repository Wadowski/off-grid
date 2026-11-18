// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const hasGracePeriodElapsed = (modifiedAt: Date, now: Date, graceMs: number): boolean =>
  now.getTime() - modifiedAt.getTime() >= graceMs;
