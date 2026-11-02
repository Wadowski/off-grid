// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { VERY_COMMON_PASSWORDS } from "../constants.js";

export const isVeryCommon = (password: string): boolean =>
  VERY_COMMON_PASSWORDS.has(password.toLowerCase());
