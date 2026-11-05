// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ReactNode } from "react";
import type {
  CreateAccountErrorTextId,
  CreateAccountFieldName,
  CreateAccountLabelTextId,
} from "../../types.js";

export type PasswordFieldProps = {
  readonly testId: string;
  readonly name: CreateAccountFieldName;
  readonly labelTextId: CreateAccountLabelTextId;
  readonly icon: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly errorTextId: CreateAccountErrorTextId | undefined;
  readonly visible: boolean;
  readonly onToggleVisible: () => void;
  readonly labelAside?: ReactNode;
  readonly footer?: ReactNode;
  readonly trailingStatus?: ReactNode;
};
