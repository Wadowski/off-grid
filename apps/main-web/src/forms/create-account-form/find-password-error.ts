// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { PASSWORD_MIN_LENGTH } from "../../constants.js";
import type { CreateAccountErrorTextId } from "./types.js";

export const findPasswordError = (password: string): CreateAccountErrorTextId | undefined => {
  if (password.length === 0) {
    return "createAccount.passwordRequired";
  }
  return [...password].length < PASSWORD_MIN_LENGTH ? "createAccount.passwordTooShort" : undefined;
};
