// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { signInAttempts } from "../infrastructure/sign-in-attempts.js";

export const isSignInLocked = (email: string, now: number): boolean => {
  const state = signInAttempts.get(email);
  return state !== undefined && state.lockedUntil > now;
};
