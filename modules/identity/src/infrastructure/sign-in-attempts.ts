// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export interface SignInAttemptState {
  failures: number;
  lockedUntil: number;
}

// Failed sign-in counts per normalised email. Held in memory only, so a restart clears them.
export const signInAttempts = new Map<string, SignInAttemptState>();
