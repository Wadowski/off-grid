// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { signInRequestSchema } from "@offgrid/contracts";
import type { SignInFieldErrors, SignInValues } from "./types.js";

export const validateSignIn = (values: SignInValues): SignInFieldErrors => ({
  email: signInRequestSchema.shape.email.safeParse(values.email.trim()).success
    ? undefined
    : "signIn.emailInvalid",
  password: values.password.length === 0 ? "signIn.passwordRequired" : undefined,
});
