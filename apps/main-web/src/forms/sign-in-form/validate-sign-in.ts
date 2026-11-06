// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { isValidEmail } from "../shared/is-valid-email.js";
import type { SignInFieldErrors, SignInValues } from "./types.js";

export const validateSignIn = (values: SignInValues): SignInFieldErrors => ({
  email: isValidEmail(values.email) ? undefined : "signIn.emailInvalid",
  password: values.password.length === 0 ? "signIn.passwordRequired" : undefined,
});
