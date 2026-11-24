// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const activityRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[3],
  paddingBlock: tokens.space[2],
  minWidth: 0,
};

export const activityRowTextStyle: CSSProperties = {
  display: "grid",
  flex: "1 1 auto",
  minWidth: 0,
  overflowWrap: "anywhere",
};

export const activityIconColor = cssVar("color-accent");
export const activityIconBackground = cssVar("color-accent-soft");
