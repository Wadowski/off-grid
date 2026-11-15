// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const detailsBodyStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[3],
  padding: `0 ${tokens.space[5]} ${tokens.space[5]}`,
  overflowY: "auto",
  minHeight: 0,
};

export const detailsCardStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[1],
  padding: tokens.space[4],
  borderRadius: tokens.radius.lg,
  background: cssVar("color-surface-low"),
};

export const detailsRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[2],
  flexWrap: "wrap",
};

export const detailsNotesStyle: CSSProperties = {
  whiteSpace: "pre-wrap",
  margin: 0,
};
