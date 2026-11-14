// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { InputHTMLAttributes, ReactNode } from "react";

export type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "style" | "className"> & {
  readonly label: ReactNode;
  readonly error?: ReactNode;
  readonly leading?: ReactNode;
  readonly trailing?: ReactNode;
  readonly labelAside?: ReactNode;
  readonly footer?: ReactNode;
  readonly mono?: boolean;
  readonly variant?: "default" | "title";
};

export type TextFieldControlState = {
  readonly errorId: string | undefined;
  readonly invalid: boolean;
};

export type TextFieldFrameProps = {
  readonly label: ReactNode;
  readonly inputId: string;
  readonly error?: ReactNode;
  readonly leading?: ReactNode;
  readonly trailing?: ReactNode;
  readonly labelAside?: ReactNode;
  readonly footer?: ReactNode;
  readonly children: (control: TextFieldControlState) => ReactNode;
};
