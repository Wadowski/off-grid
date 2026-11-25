// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CSSProperties } from "react";
import { cssVar } from "../../../css-var.js";
import type { MenuTone } from "../../types.js";

export const menuItemStyle = (tone: MenuTone): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: cssVar("space-3"),
  width: "100%",
  minHeight: "2.75rem",
  padding: `${cssVar("space-2")} ${cssVar("space-3")}`,
  border: "none",
  borderRadius: cssVar("radius-md"),
  background: "transparent",
  color: tone === "danger" ? cssVar("color-danger") : cssVar("color-fg"),
  cursor: "pointer",
  textAlign: "start",
  fontFamily: cssVar("font-family-base"),
});

export const menuItemIconColor = (tone: MenuTone): string =>
  tone === "danger" ? cssVar("color-danger") : cssVar("color-muted");
