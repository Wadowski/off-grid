// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { findConfirmationError } from "../create-account-form/find-confirmation-error.js";
import { findPasswordError } from "../create-account-form/find-password-error.js";
import type { ResetPasswordFieldErrors, ResetPasswordValues } from "./types.js";

export const validateResetPassword = (values: ResetPasswordValues): ResetPasswordFieldErrors => ({
  code: values.code.trim().length === 0 ? "resetPassword.codeRequired" : undefined,
  password: findPasswordError(values.password),
  confirmation: findConfirmationError(values.password, values.confirmation),
});
