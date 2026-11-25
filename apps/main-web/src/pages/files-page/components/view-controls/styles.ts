// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

const CONTROL_HEIGHT = "2rem";

export const viewControlsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: tokens.space[2],
};

export const viewToggleStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "2px",
  height: CONTROL_HEIGHT,
  padding: "2px",
  borderRadius: cssVar("radius-md"),
  background: cssVar("color-surface-high"),
};

export const viewToggleOptionStyle = (selected: boolean): CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "1.75rem",
  height: "1.75rem",
  padding: 0,
  borderWidth: 0,
  borderRadius: cssVar("radius-sm"),
  background: selected ? cssVar("color-surface") : "transparent",
  boxShadow: selected ? cssVar("elevation-1") : "none",
  color: selected ? cssVar("color-fg") : cssVar("color-outline"),
  cursor: "pointer",
});

export const sortTriggerStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: tokens.space[1],
  height: CONTROL_HEIGHT,
  padding: `0 ${tokens.space[1]} 0 ${tokens.space[2]}`,
  borderRadius: cssVar("radius-md"),
  border: `1px solid ${cssVar("color-surface-high")}`,
  background: cssVar("color-surface-low"),
  color: cssVar("color-fg"),
  fontFamily: cssVar("font-family-base"),
  fontSize: cssVar("font-size-label-md"),
  lineHeight: cssVar("line-height-label-md"),
  whiteSpace: "nowrap",
};

export const sortLabelStyle: CSSProperties = {
  color: cssVar("color-muted"),
  fontWeight: cssVar("font-weight-medium"),
};

export const sortSelectStyle: CSSProperties = {
  appearance: "none",
  margin: 0,
  padding: `0 ${tokens.space[1]} 0 0`,
  borderWidth: 0,
  background: "transparent",
  color: "inherit",
  fontFamily: "inherit",
  fontSize: "inherit",
  fontWeight: cssVar("font-weight-semibold"),
  cursor: "pointer",
};

export const sortChevronStyle: CSSProperties = {
  display: "inline-flex",
  pointerEvents: "none",
  marginLeft: "-0.25rem",
};

export const sortDividerStyle: CSSProperties = {
  width: "1px",
  height: "1rem",
  background: cssVar("color-line"),
};

export const sortDirectionStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "1.5rem",
  height: "1.5rem",
  padding: 0,
  borderWidth: 0,
  borderRadius: cssVar("radius-sm"),
  background: "transparent",
  cursor: "pointer",
};
