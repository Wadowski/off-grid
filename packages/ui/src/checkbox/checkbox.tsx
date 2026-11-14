// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { checkboxInputStyle, checkboxLabelStyle } from "./styles.js";
import type { CheckboxProps } from "./types.js";

export const Checkbox = ({ label, variant = "checkbox", ...rest }: CheckboxProps) => (
  <label style={checkboxLabelStyle}>
    <input
      type="checkbox"
      role={variant === "switch" ? "switch" : undefined}
      className={variant === "switch" ? "og-focusable og-switch" : "og-focusable"}
      style={checkboxInputStyle}
      {...rest}
    />
    {label}
  </label>
);
