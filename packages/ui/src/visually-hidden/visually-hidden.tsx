// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { visuallyHiddenStyle } from "./styles.js";
import type { VisuallyHiddenProps } from "./types.js";

export const VisuallyHidden = ({ children }: VisuallyHiddenProps) => {
  return <span style={visuallyHiddenStyle}>{children}</span>;
};
