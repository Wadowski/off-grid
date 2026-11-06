// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const userMenuStyle: CSSProperties = {
  position: "relative",
};

export const userMenuPanelStyle: CSSProperties = {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: "calc(100% + 0.5rem)",
  zIndex: 60,
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[1],
  padding: tokens.space[3],
  borderRadius: tokens.radius.md,
  borderStyle: "solid",
  borderWidth: "1px",
  borderColor: "var(--og-color-muted)",
  background: "var(--og-color-surface)",
  color: "var(--og-color-fg)",
  boxShadow: tokens.elevation[1],
};

export const userMenuIdentityStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[1],
  paddingBottom: tokens.space[2],
};

export const userMenuItemStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  minHeight: "2.75rem",
  padding: `0 ${tokens.space[2]}`,
  borderRadius: tokens.radius.md,
  borderStyle: "none",
  background: "transparent",
  color: "var(--og-color-fg)",
  fontFamily: tokens.font.family.base,
  textAlign: "start",
  textDecoration: "none",
  cursor: "pointer",
};
