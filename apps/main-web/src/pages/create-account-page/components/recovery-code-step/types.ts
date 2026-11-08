// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { AccountIntroProps } from "../account-intro/types.js";

export type RecoveryCodeStepProps = {
  readonly recoveryCode: string;
  readonly intro: AccountIntroProps;
  readonly onContinue: () => void | Promise<void>;
};

export type RecoveryContinueStatus = "idle" | "submitting" | "failed";
