// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ParseKeys } from "i18next";
import type { ButtonHTMLAttributes, ElementType, Ref } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost";

export type ButtonSize = "medium" | "small" | "icon";

export type ButtonAlign = "center" | "start";

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "style" | "className"> & {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly align?: ButtonAlign;
  readonly fullWidth?: boolean;
  readonly ref?: Ref<HTMLButtonElement>;
  readonly as?: ElementType;
  readonly to?: string;
  readonly ariaLabelTextId?: ParseKeys;
};

export type Translate = (key: string) => string;
