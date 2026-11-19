// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { MAX_TIMER_DELAY_MS } from "../../constants.js";

export const scheduleStreamExpiry = (
  accessExpiresAt: Date,
  now: number,
  onExpired: () => void,
): (() => void) => {
  const delay = Math.min(Math.max(accessExpiresAt.getTime() - now, 0), MAX_TIMER_DELAY_MS);
  const timer = setTimeout(onExpired, delay);
  return () => clearTimeout(timer);
};
