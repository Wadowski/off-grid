// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Clock } from "../src/types.js";

export const createFakeClock = (): Clock & { readonly elapsed: () => number } => {
  let current = 0;
  return {
    now: () => current,
    sleep: async (milliseconds) => {
      current += milliseconds;
    },
    elapsed: () => current,
  };
};
