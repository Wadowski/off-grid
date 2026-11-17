// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CSSProperties } from "react";
import { cssVar } from "../css-var.js";

export const fileRowStyle = (selected: boolean): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: cssVar("space-3"),
  minHeight: "3.5rem",
  padding: `${cssVar("space-2")} ${cssVar("space-3")}`,
  borderBottom: `1px solid ${cssVar("color-line")}`,
  background: selected ? cssVar("color-accent-soft") : "transparent",
  color: cssVar("color-fg"),
});

export const fileRowActivatorStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: cssVar("space-3"),
  flex: 1,
  minWidth: 0,
  borderRadius: cssVar("radius-md"),
};

export const fileRowTextStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
  flex: 1,
};

export const fileRowTrailingStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  flexShrink: 0,
};
