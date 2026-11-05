// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { findConfirmationError } from "./find-confirmation-error.js";
import { findEmailError } from "./find-email-error.js";
import { findNameError } from "./find-name-error.js";
import { findPasswordError } from "./find-password-error.js";
import type { CreateAccountFieldErrors, CreateAccountValues } from "./types.js";

export const validateCreateAccount = (values: CreateAccountValues): CreateAccountFieldErrors => ({
  displayName: findNameError(values.displayName),
  email: findEmailError(values.email),
  password: findPasswordError(values.password),
  confirmation: findConfirmationError(values.password, values.confirmation),
});
