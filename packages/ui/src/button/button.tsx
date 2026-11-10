// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import {
  buttonAlignStyles,
  buttonBaseStyle,
  buttonDisabledStyle,
  buttonFullWidthStyle,
  buttonSizeStyles,
  buttonVariantStyles,
} from "./styles.js";
import type { ButtonProps } from "./types.js";

export const Button = ({
  variant = "primary",
  size = "medium",
  align = "center",
  fullWidth = false,
  type = "button",
  ...rest
}: ButtonProps) => {
  return (
    <button
      type={type}
      className="og-focusable"
      style={{
        ...buttonBaseStyle,
        ...buttonVariantStyles[variant],
        ...buttonSizeStyles[size],
        ...buttonAlignStyles[align],
        ...(fullWidth ? buttonFullWidthStyle : {}),
        ...(rest.disabled === true ? buttonDisabledStyle : {}),
      }}
      {...rest}
    />
  );
};
