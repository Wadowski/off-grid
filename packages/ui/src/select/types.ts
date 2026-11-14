// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { SelectHTMLAttributes } from "react";

export type SelectOption = {
  readonly value: string;
  readonly label: string;
};

export type SelectAccent = {
  readonly background: string;
  readonly color: string;
};

export type SelectProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "style" | "className" | "children"
> & {
  readonly options: readonly SelectOption[];
  readonly accent?: SelectAccent;
};
