// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tagBaseStyle, tagToneStyles } from "./styles.js";
import type { TagProps } from "./types.js";

export const Tag = ({ tone = "neutral", children, ...rest }: TagProps) => (
  <span style={{ ...tagBaseStyle, ...tagToneStyles[tone] }} {...rest}>
    {children}
  </span>
);
