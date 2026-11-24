// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ParseKeys } from "i18next";
import type { SelectHTMLAttributes } from "react";

type StaticSelectOptionLabel = {
  readonly label: string;
  readonly labelTextId?: never;
};

type TextIdSelectOptionLabel = {
  readonly labelTextId: ParseKeys;
  readonly label?: never;
};

export type SelectOption = {
  readonly value: string;
} & (StaticSelectOptionLabel | TextIdSelectOptionLabel);

export type SelectAccent = {
  readonly background: string;
  readonly color: string;
};

export type SelectVariant = "default" | "field";

export type SelectProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "style" | "className" | "children" | "aria-label"
> & {
  readonly labelTextId?: ParseKeys;
  readonly options: readonly SelectOption[];
  readonly accent?: SelectAccent;
  readonly variant?: SelectVariant;
};

export type Translate = (key: string) => string;
