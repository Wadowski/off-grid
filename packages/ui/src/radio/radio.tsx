// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { radioInputStyle, radioLabelStyle } from "./styles.js";
import type { RadioProps } from "./types.js";

export const Radio = ({ label, ...rest }: RadioProps) => {
  return (
    <label style={radioLabelStyle}>
      <input type="radio" className="og-focusable" style={radioInputStyle} {...rest} />
      <span>{label}</span>
    </label>
  );
};
