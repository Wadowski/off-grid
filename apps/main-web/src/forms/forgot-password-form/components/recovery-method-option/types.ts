// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { RecoveryMethod } from "../../../../recovery/types.js";

export type RecoveryMethodOptionProps = {
  readonly method: RecoveryMethod;
  readonly selected: boolean;
  readonly onSelect: (method: RecoveryMethod) => void;
  readonly labelTextId: "forgotPassword.methodRecoveryCode" | "forgotPassword.methodEmailCode";
  readonly hintTextId:
    "forgotPassword.methodRecoveryCodeHint" | "forgotPassword.methodEmailCodeHint";
};
