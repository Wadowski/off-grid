// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type RecoveryMethod = "recoveryCode" | "emailCode";

export type RecoveryRouteState = {
  readonly email: string;
  readonly method: RecoveryMethod;
};
