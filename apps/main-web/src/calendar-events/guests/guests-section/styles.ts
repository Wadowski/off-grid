// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const guestsSectionStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[2],
  padding: tokens.space[4],
  borderRadius: tokens.radius.lg,
  background: cssVar("color-surface-low"),
};

export const guestRowsStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(10rem, 1fr))",
  gap: tokens.space[2],
};

export const guestRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[2],
};

export const guestInitialStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: tokens.space[6],
  height: tokens.space[6],
  borderRadius: tokens.radius.full,
  background: cssVar("color-primary"),
  color: cssVar("color-on-primary"),
  fontWeight: tokens.font.weight.semibold,
};
