// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const settingsSubpageStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[4],
  maxWidth: "40rem",
  marginInline: "auto",
  minWidth: 0,
};

export const settingsBackLinkStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: tokens.space[1],
  justifySelf: "start",
  minHeight: "44px",
  color: cssVar("color-accent"),
  textDecoration: "none",
};

export const settingsSubpageContentStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[3],
  padding: tokens.space[4],
  borderRadius: cssVar("radius-lg"),
  background: cssVar("color-surface"),
  boxShadow: cssVar("elevation-1"),
  minWidth: 0,
};
