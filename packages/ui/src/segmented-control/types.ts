// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ReactNode } from "react";

export type SegmentedControlOption<Value extends string> = {
  readonly value: Value;
  readonly label: ReactNode;
};

export type SegmentedControlProps<Value extends string> = {
  readonly label: string;
  readonly options: readonly SegmentedControlOption<Value>[];
  readonly value: Value;
  readonly onChange: (value: Value) => void;
};
