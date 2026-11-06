// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { KeyboardEventHandler, ReactNode } from "react";
import type { CreateAccountErrorTextId } from "../../types.js";

export type PasswordFieldProps = {
  readonly testId: string;
  readonly name: string;
  readonly labelTextId:
    "createAccount.passwordLabel" | "createAccount.confirmLabel" | "signIn.passwordLabel";
  readonly icon: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly errorTextId: CreateAccountErrorTextId | "signIn.passwordRequired" | undefined;
  readonly visible: boolean;
  readonly onToggleVisible: () => void;
  readonly autoComplete?: "new-password" | "current-password";
  readonly onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
  readonly onKeyUp?: KeyboardEventHandler<HTMLInputElement>;
  readonly labelAside?: ReactNode;
  readonly footer?: ReactNode;
  readonly trailingStatus?: ReactNode;
};
