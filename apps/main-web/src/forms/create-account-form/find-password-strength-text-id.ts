// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { PASSWORD_MIN_LENGTH } from "../../constants.js";
import type { PasswordStrengthTextId } from "./types.js";

export const findPasswordStrengthTextId = (
  password: string,
): PasswordStrengthTextId | undefined => {
  if (password.length === 0) {
    return undefined;
  }
  return [...password].length < PASSWORD_MIN_LENGTH
    ? "createAccount.strength.tooWeak"
    : "createAccount.strength.strong";
};
