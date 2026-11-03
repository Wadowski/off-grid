// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CreateAccountErrorTextId, CreateAccountFieldName } from "../../types.js";

export type PasswordFieldProps = {
  readonly testId: string;
  readonly name: CreateAccountFieldName;
  readonly labelTextId: "createAccount.passwordLabel" | "createAccount.confirmLabel";
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly errorTextId: CreateAccountErrorTextId | undefined;
  readonly visible: boolean;
  readonly onToggleVisible: () => void;
};
