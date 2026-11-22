// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const driveSwitcherGroupStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[2],
  minWidth: 0,
};

export const driveSwitcherGroupCaptionStyle: CSSProperties = {
  color: cssVar("color-muted"),
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  paddingInline: tokens.space[1],
};

export const driveSwitcherGroupListStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[2],
  listStyle: "none",
  margin: 0,
  padding: 0,
};
