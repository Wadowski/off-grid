// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const swatchesStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: tokens.space[2],
};

const swatchBaseStyle: CSSProperties = {
  width: "1.5rem",
  height: "1.5rem",
  borderRadius: tokens.radius.full,
  borderStyle: "solid",
  borderWidth: "2px",
  borderColor: "transparent",
};

export const swatchStyle = (background: string, selected: boolean): CSSProperties => ({
  ...swatchBaseStyle,
  background,
  borderColor: selected ? cssVar("color-fg") : "transparent",
});
