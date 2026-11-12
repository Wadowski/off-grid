// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type SegmentedControlOption<Value extends string> = {
  readonly value: Value;
  readonly label: string;
};

export type SegmentedControlProps<Value extends string> = {
  readonly label: string;
  readonly options: readonly SegmentedControlOption<Value>[];
  readonly value: Value;
  readonly onChange: (value: Value) => void;
};
