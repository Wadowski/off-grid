// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const accessRowStyle = (isFirst: boolean): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: tokens.space[3],
  paddingBlock: tokens.space[3],
  borderTop: isFirst ? "none" : `1px solid ${cssVar("color-surface-high")}`,
  minWidth: 0,
});

export const accessRowTextStyle: CSSProperties = {
  display: "grid",
  flex: "1 1 auto",
  minWidth: 0,
  overflowWrap: "anywhere",
};

export const accessCanEditStyle: CSSProperties = {
  flex: "0 0 auto",
  color: cssVar("color-muted"),
};
