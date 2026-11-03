// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const authLayoutStyle: CSSProperties = {
  minHeight: "100vh",
  display: "grid",
  gridTemplateRows: "1fr auto",
  fontFamily: tokens.font.family.base,
  background: "var(--og-color-bg)",
  color: "var(--og-color-fg)",
};

export const authLayoutMainStyle: CSSProperties = {
  display: "grid",
  alignContent: "center",
  justifyItems: "center",
  gap: tokens.space[4],
  padding: tokens.space[5],
};

export const authCardStyle: CSSProperties = {
  width: "100%",
  maxWidth: "26rem",
  display: "grid",
  gap: tokens.space[4],
  padding: tokens.space[5],
  borderRadius: tokens.radius.md,
  background: "var(--og-color-surface)",
};

export const authLayoutFooterStyle: CSSProperties = {
  padding: tokens.space[4],
  textAlign: "center",
};
