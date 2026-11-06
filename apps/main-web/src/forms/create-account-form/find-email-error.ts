// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { isValidEmail } from "../shared/is-valid-email.js";
import type { CreateAccountErrorTextId } from "./types.js";

export const findEmailError = (email: string): CreateAccountErrorTextId | undefined =>
  isValidEmail(email.trim()) ? undefined : "createAccount.emailInvalid";
