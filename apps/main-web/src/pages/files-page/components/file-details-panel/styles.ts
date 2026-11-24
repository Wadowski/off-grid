// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const fileDetailsPanelStyle: CSSProperties = {
  display: "grid",
  alignContent: "start",
  gap: tokens.space[3],
  padding: tokens.space[4],
  borderRadius: cssVar("radius-lg"),
  background: cssVar("color-surface"),
  border: `1px solid ${cssVar("color-surface-high")}`,
  boxShadow: cssVar("elevation-1"),
  color: cssVar("color-fg"),
  position: "sticky",
  top: tokens.space[4],
  minWidth: 0,
};
