// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ReactNode } from "react";

export type MultiSelectOption = {
  readonly value: string;
  readonly label: string;
  readonly adornment?: ReactNode;
};

export type MultiSelectProps = {
  readonly options: readonly MultiSelectOption[];
  readonly selected: ReadonlySet<string>;
  readonly onChange: (selected: ReadonlySet<string>) => void;
  readonly summary: string;
  readonly triggerLabel: string;
  readonly groupLabel: string;
  readonly testId: string;
};
