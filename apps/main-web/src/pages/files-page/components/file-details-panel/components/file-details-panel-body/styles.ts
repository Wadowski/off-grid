// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const fileDetailsPanelSectionStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[3],
  padding: tokens.space[3],
  borderRadius: cssVar("radius-md"),
  background: cssVar("color-surface-low"),
  minWidth: 0,
};

export const fileDetailsPanelHeadingStyle: CSSProperties = {
  color: cssVar("color-fg"),
  fontWeight: cssVar("font-weight-semibold"),
  letterSpacing: cssVar("letter-spacing-label-sm"),
  textTransform: "uppercase",
};

export const fileDetailsPanelListStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[2],
  margin: 0,
  padding: 0,
  minWidth: 0,
};

export const fileDetailsPanelRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  gap: tokens.space[4],
  minWidth: 0,
};

export const fileDetailsPanelLabelStyle: CSSProperties = {
  flex: "0 0 auto",
  margin: 0,
  color: cssVar("color-muted"),
};

export const fileDetailsPanelValueStyle: CSSProperties = {
  display: "grid",
  justifyItems: "end",
  margin: 0,
  minWidth: 0,
  maxWidth: "70%",
  textAlign: "right",
  overflowWrap: "anywhere",
};
