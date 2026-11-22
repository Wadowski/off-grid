// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const backLinkStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  alignSelf: "start",
  gap: tokens.space[2],
  minHeight: "2.75rem",
  minWidth: 0,
  maxWidth: "100%",
  color: cssVar("color-primary"),
  textDecoration: "none",
};
