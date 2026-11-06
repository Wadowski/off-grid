// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { checkboxInputStyle, checkboxLabelStyle } from "./styles.js";
import type { CheckboxProps } from "./types.js";

export const Checkbox = ({ label, ...rest }: CheckboxProps) => {
  return (
    <label style={checkboxLabelStyle}>
      <input type="checkbox" className="og-focusable" style={checkboxInputStyle} {...rest} />
      {label}
    </label>
  );
};
