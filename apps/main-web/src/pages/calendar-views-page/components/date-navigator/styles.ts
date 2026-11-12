// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const dateNavigatorStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: cssVar("space-2"),
};

export const dateNavigatorControlsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: cssVar("space-1"),
  minWidth: 0,
};

export const dateNavigatorArrowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "2.75rem",
  height: "2.75rem",
  padding: 0,
  borderWidth: 0,
  borderRadius: cssVar("radius-full"),
  background: "transparent",
  color: cssVar("color-muted"),
  cursor: "pointer",
};

export const dateNavigatorLabelStyle: CSSProperties = {
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};
