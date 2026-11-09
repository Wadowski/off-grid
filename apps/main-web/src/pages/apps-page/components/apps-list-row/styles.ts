// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const appsListRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[3],
  padding: `${tokens.space[3]} ${tokens.space[4]}`,
  borderBottom: `1px solid ${cssVar("color-surface-high")}`,
  color: cssVar("color-fg"),
  textDecoration: "none",
};

export const appsListRowDisabledStyle: CSSProperties = {
  ...appsListRowStyle,
  color: cssVar("color-outline"),
};

export const appsListRowTileStyle = (appId: string): CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  width: "2.75rem",
  height: "2.75rem",
  borderRadius: tokens.radius.lg,
  background: `linear-gradient(135deg, ${cssVar(`color-app-${appId}-from`)}, ${cssVar(`color-app-${appId}-to`)})`,
  color: cssVar("color-accent-fg"),
});

export const appsListRowChevronStyle: CSSProperties = {
  display: "inline-flex",
  marginLeft: "auto",
};

export const appsListRowChevronColor = cssVar("color-outline");
