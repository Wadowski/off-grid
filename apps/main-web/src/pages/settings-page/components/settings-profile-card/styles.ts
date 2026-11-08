// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const profileCardStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[3],
  padding: tokens.space[3],
  borderRadius: cssVar("radius-lg"),
  background: cssVar("color-surface"),
  boxShadow: cssVar("elevation-1"),
  minWidth: 0,
};

export const profileAvatarStyle: CSSProperties = {
  display: "grid",
  placeItems: "center",
  width: "3.5rem",
  height: "3.5rem",
  borderRadius: "9999px",
  background: cssVar("color-accent"),
  color: cssVar("color-accent-fg"),
  fontWeight: 600,
  flexShrink: 0,
};

export const profileTextStyle: CSSProperties = {
  display: "grid",
  gap: "0.125rem",
  minWidth: 0,
};

export const profileRoleChipStyle: CSSProperties = {
  justifySelf: "start",
  padding: "0.125rem 0.5rem",
  borderRadius: "9999px",
  background: cssVar("color-accent-soft"),
  color: cssVar("color-accent"),
};
