// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { constants } from "node:os";

export const exitCodeOf = (code: number | null, signal: NodeJS.Signals | null): number => {
  if (code !== null) {
    return code;
  }
  return 128 + (signal === null ? 0 : constants.signals[signal]);
};
