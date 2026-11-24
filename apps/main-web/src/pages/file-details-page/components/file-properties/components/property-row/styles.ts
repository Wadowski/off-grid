// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const propertyRowStyle = (isFirst: boolean): CSSProperties => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  gap: tokens.space[4],
  paddingBlock: tokens.space[2],
  borderTop: isFirst ? "none" : `1px solid ${cssVar("color-surface-high")}`,
  minWidth: 0,
});

export const propertyLabelStyle: CSSProperties = {
  flex: "0 0 auto",
  margin: 0,
  color: cssVar("color-muted"),
};

export const propertyValueStyle: CSSProperties = {
  display: "grid",
  justifyItems: "end",
  margin: 0,
  minWidth: 0,
  maxWidth: "70%",
  textAlign: "right",
  overflowWrap: "anywhere",
};
