// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { RECOVERY_USAGE } from "../constants.js";

export const requireOption = (value: string | undefined, flag: string): string => {
  if (value === undefined || value.length === 0) {
    throw new Error(`${flag} is required\n${RECOVERY_USAGE}`);
  }
  return value;
};
