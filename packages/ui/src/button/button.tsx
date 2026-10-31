// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { buttonBaseStyle, buttonVariantStyles } from "./styles.js";
import type { ButtonProps } from "./types.js";

export const Button = ({ variant = "primary", type = "button", ...rest }: ButtonProps) => {
  return (
    <button
      type={type}
      className="og-focusable"
      style={{ ...buttonBaseStyle, ...buttonVariantStyles[variant] }}
      {...rest}
    />
  );
};
