// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type RecoveryCodeActionsProps = {
  readonly recoveryCode: string;
};

export type RecoveryCopyStatus = "idle" | "copied" | "failed";
