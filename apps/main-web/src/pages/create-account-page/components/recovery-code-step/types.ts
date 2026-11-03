// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type RecoveryCodeStepProps = {
  readonly recoveryCode: string;
};

export type RecoveryContinueStatus = "idle" | "submitting" | "failed";
