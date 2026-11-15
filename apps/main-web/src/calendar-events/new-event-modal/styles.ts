// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const newEventIconTileBackground = `color-mix(in srgb, ${cssVar("color-primary")} 12%, transparent)`;

export const newEventHeadingStyle: CSSProperties = {
  margin: 0,
  fontSize: tokens.font.size["headline-sm"],
  lineHeight: tokens.font.lineHeight["headline-sm"],
  letterSpacing: tokens.font.letterSpacing["headline-sm"],
  fontWeight: tokens.font.weight.semibold,
};

export const newEventBodyStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[3],
  padding: `${tokens.space[4]} ${tokens.space[5]}`,
  overflowY: "auto",
  minHeight: 0,
};

export const newEventErrorStyle: CSSProperties = {
  margin: 0,
};
