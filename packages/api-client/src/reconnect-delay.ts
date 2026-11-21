// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { STREAM_BACKOFF_INITIAL_MS, STREAM_BACKOFF_MAX_MS } from "./constants.js";

export const reconnectDelay = (attempt: number, random: () => number): number => {
  const cap = Math.min(STREAM_BACKOFF_INITIAL_MS * 2 ** attempt, STREAM_BACKOFF_MAX_MS);
  return cap * (0.5 + random() * 0.5);
};
