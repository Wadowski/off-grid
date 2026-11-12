// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const calendarFilterSelectStyle: CSSProperties = {
  alignSelf: "flex-start",
  maxWidth: "100%",
  padding: `${tokens.space[1]} ${tokens.space[3]}`,
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: cssVar("color-line"),
  borderRadius: cssVar("radius-full"),
  background: cssVar("color-surface"),
  color: cssVar("color-fg"),
  fontFamily: cssVar("font-family-base"),
  fontSize: cssVar("font-size-label-md"),
  lineHeight: cssVar("line-height-label-md"),
  fontWeight: cssVar("font-weight-medium"),
};
