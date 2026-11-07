// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost";

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "style" | "className"> & {
  readonly variant?: ButtonVariant;
  readonly fullWidth?: boolean;
};
