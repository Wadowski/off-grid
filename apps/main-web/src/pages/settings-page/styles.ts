// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const settingsPageStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[4],
  maxWidth: "40rem",
  minWidth: 0,
};

export const settingsSummaryStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[3],
  minWidth: 0,
};

export const settingsAvatarStyle: CSSProperties = {
  display: "grid",
  placeItems: "center",
  width: "3rem",
  height: "3rem",
  borderRadius: "9999px",
  background: cssVar("color-primary"),
  color: cssVar("color-on-primary"),
  fontWeight: 600,
  flexShrink: 0,
};

export const settingsLinkListStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[2],
  margin: 0,
  padding: 0,
  listStyle: "none",
};

export const settingsLinkStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[1],
  padding: tokens.space[3],
  borderRadius: "0.75rem",
  border: `1px solid ${cssVar("color-line")}`,
  textDecoration: "none",
  color: "inherit",
  minHeight: "44px",
};

export const settingsSignOutStyle: CSSProperties = {
  justifySelf: "start",
};
