// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { InputHTMLAttributes, ReactNode } from "react";

export type RadioProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "style" | "className" | "type"
> & {
  readonly label: ReactNode;
  /** Stacks the input above the label content and centres both. */
  readonly centered?: boolean;
};
