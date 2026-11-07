// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { isValidEmail } from "../shared/is-valid-email.js";
import type { ForgotPasswordEmailTextId } from "./types.js";

export const findEmailError = (email: string): ForgotPasswordEmailTextId | undefined =>
  isValidEmail(email.trim()) ? undefined : "signIn.emailInvalid";
