// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const calendarFormStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[5],
  textAlign: "left",
};

export const calendarFormFooterStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: tokens.space[3],
};

export const ownerTextStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[1],
  color: cssVar("color-fg"),
};

export const ownerSelectLabelStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[2],
};
