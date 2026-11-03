// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { signInAttempts } from "../../infrastructure/sign-in-attempts/sign-in-attempts.js";

export const clearSignInFailures = (email: string): void => {
  signInAttempts.delete(email);
};
