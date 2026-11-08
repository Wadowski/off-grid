// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { PASSWORD_MIN_LENGTH } from "../../constants.js";
import type { PasswordFieldErrors, PasswordFormValues } from "./types.js";

export const findPasswordFieldError = (values: PasswordFormValues): PasswordFieldErrors => {
  const errors: PasswordFieldErrors = {};
  if (values.currentPassword.length === 0) {
    errors.currentPassword = "settings.currentPasswordRequired";
  }
  if (values.newPassword.length < PASSWORD_MIN_LENGTH) {
    errors.newPassword = "settings.passwordTooShort";
  } else if (values.confirmation !== values.newPassword) {
    errors.confirmation = "settings.confirmationMismatch";
  }
  return errors;
};
