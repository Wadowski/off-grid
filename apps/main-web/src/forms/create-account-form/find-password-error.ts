// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { PASSWORD_MIN_LENGTH } from "../../constants.js";
import { countPasswordCharacters } from "./count-password-characters.js";
import type { CreateAccountErrorTextId } from "./types.js";

export const findPasswordError = (password: string): CreateAccountErrorTextId | undefined => {
  if (password.length === 0) {
    return "createAccount.passwordRequired";
  }
  return countPasswordCharacters(password) < PASSWORD_MIN_LENGTH
    ? "createAccount.passwordTooShort"
    : undefined;
};
