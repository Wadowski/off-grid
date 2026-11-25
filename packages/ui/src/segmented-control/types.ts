// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ParseKeys } from "i18next";
import type { ReactNode } from "react";

type StaticOptionLabel = {
  readonly label: ReactNode;
  readonly labelTextId?: never;
};

type TextIdOptionLabel = {
  readonly labelTextId: ParseKeys;
  readonly label?: never;
};

export type SegmentedControlOption<Value extends string> = {
  readonly value: Value;
} & (StaticOptionLabel | TextIdOptionLabel);

type StaticGroupLabel = {
  readonly label: string;
  readonly labelTextId?: never;
};

type TextIdGroupLabel = {
  readonly labelTextId: ParseKeys;
  readonly label?: never;
};

export type SegmentedControlProps<Value extends string> = (StaticGroupLabel | TextIdGroupLabel) & {
  readonly options: readonly SegmentedControlOption<Value>[];
  readonly value: Value;
  readonly onChange: (value: Value) => void;
};

export type Translate = (key: string) => string;
