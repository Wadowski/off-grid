// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ReactNode, TextareaHTMLAttributes } from "react";

export type TextareaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "style" | "className"
> & {
  readonly label: ReactNode;
  readonly error?: ReactNode;
};
