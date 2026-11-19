// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { RunLock } from "../types.js";

export const createRunLock = (): RunLock => {
  let held = false;
  return {
    tryAcquire: () => {
      if (held) {
        return null;
      }
      held = true;
      return () => {
        held = false;
      };
    },
    isHeld: () => held,
  };
};
