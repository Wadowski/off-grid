// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CSSProperties } from "react";
import { FLOATING_PANEL_Z_INDEX } from "../constants.js";
import { cssVar } from "../css-var.js";
import type { FloatingPanelPlacement } from "./types.js";

const FLOATING_PANEL_BASE_STYLE: CSSProperties = {
  position: "fixed",
  zIndex: FLOATING_PANEL_Z_INDEX,
  display: "flex",
  flexDirection: "column",
  boxSizing: "border-box",
  background: cssVar("color-surface"),
  color: cssVar("color-fg"),
  boxShadow: cssVar("elevation-2"),
  border: `1px solid ${cssVar("color-surface-high")}`,
  overflow: "hidden",
};

const FLOATING_PANEL_PLACEMENT_STYLES: Record<FloatingPanelPlacement, CSSProperties> = {
  corner: {
    right: cssVar("space-6"),
    bottom: cssVar("space-6"),
    width: "24rem",
    maxWidth: "calc(100vw - 2rem)",
    borderRadius: cssVar("radius-lg"),
  },
  sheet: {
    left: 0,
    right: 0,
    bottom: "calc(4.5rem + env(safe-area-inset-bottom, 0px))",
    borderRadius: `${cssVar("radius-lg")} ${cssVar("radius-lg")} 0 0`,
  },
};

export const floatingPanelStyle = (placement: FloatingPanelPlacement): CSSProperties => ({
  ...FLOATING_PANEL_BASE_STYLE,
  ...FLOATING_PANEL_PLACEMENT_STYLES[placement],
});
