// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ReactNode } from "react";
import type { CreateAccountErrorTextId, CreateAccountLabelTextId } from "../../types.js";

export type TrailingInset = "status" | "action";

export type FormFieldProps = {
  readonly testId: string;
  readonly name: string;
  readonly labelTextId: CreateAccountLabelTextId;
  readonly icon: string;
  readonly type: "text" | "email" | "password";
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly autoComplete: string;
  readonly mono?: boolean;
  readonly errorTextId?: CreateAccountErrorTextId;
  readonly trailing?: ReactNode;
  readonly trailingInset?: TrailingInset;
  readonly labelAside?: ReactNode;
  readonly footer?: ReactNode;
};
