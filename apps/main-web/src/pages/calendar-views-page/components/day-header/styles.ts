// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const DAY_HEADING_CLASS = "og-day-heading";

// The date heading stays on one line and only truncates with an ellipsis when it cannot fit.
// The text sits in the heading element Text renders, so the rule targets that child.
export const dayHeadingCss = `
.${DAY_HEADING_CLASS} {
  min-width: 0;
  overflow: hidden;
}
.${DAY_HEADING_CLASS} > * {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
`;

export const dayHeaderStyle: CSSProperties = {
  minWidth: 0,
  paddingTop: tokens.space[1],
};
