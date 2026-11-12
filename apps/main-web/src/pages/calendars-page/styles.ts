// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";
import { familiesPageStyle } from "../families-page/styles.js";

export const calendarsPageStyle: CSSProperties = {
  ...familiesPageStyle,
  maxWidth: "40rem",
  minWidth: 0,
  marginInline: "auto",
};

export const calendarsHeaderStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: tokens.space[3],
};

export const calendarListStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[2],
  listStyle: "none",
  margin: 0,
  padding: 0,
};

export const statusStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[1],
  color: cssVar("color-muted"),
};
