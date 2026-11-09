// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ParseKeys } from "i18next";

export type AdminRadioOption<Value extends string> = {
  readonly value: Value;
  readonly labelTextId: ParseKeys;
};

export type AdminRadioGroupProps<Value extends string> = {
  readonly name: string;
  readonly legendTextId: ParseKeys;
  readonly options: readonly AdminRadioOption<Value>[];
  readonly value: Value;
  readonly onChange: (value: Value) => void;
};
