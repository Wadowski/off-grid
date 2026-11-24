// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CSSProperties } from "react";
import { cssVar } from "../css-var.js";

export const menuPanelStyle: CSSProperties = {
  position: "fixed",
  inset: "auto",
  margin: 0,
  minWidth: "11rem",
  padding: cssVar("space-2"),
  border: `1px solid ${cssVar("color-line")}`,
  borderRadius: cssVar("radius-md"),
  background: cssVar("color-surface"),
  color: cssVar("color-fg"),
  boxShadow: cssVar("elevation-2"),
};

export const menuDividerStyle: CSSProperties = {
  height: "1px",
  margin: `${cssVar("space-1")} 0`,
  background: cssVar("color-line"),
};
