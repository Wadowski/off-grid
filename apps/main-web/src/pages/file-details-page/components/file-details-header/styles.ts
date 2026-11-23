// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const fileDetailsHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[2],
  minWidth: 0,
};

export const fileDetailsBackLinkStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flex: "0 0 auto",
  width: "2.75rem",
  height: "2.75rem",
  borderRadius: cssVar("radius-full"),
  color: cssVar("color-primary"),
  textDecoration: "none",
};
