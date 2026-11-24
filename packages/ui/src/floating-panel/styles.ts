// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CSSProperties } from "react";
import { FLOATING_PANEL_Z_INDEX } from "../constants.js";
import { cssVar } from "../css-var.js";
import type { FloatingPanelPlacement, FloatingPanelShape, FloatingPanelTone } from "./types.js";

const FLOATING_PANEL_BASE_STYLE: CSSProperties = {
  position: "fixed",
  zIndex: FLOATING_PANEL_Z_INDEX,
  display: "flex",
  flexDirection: "column",
  boxSizing: "border-box",
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
  },
  sheet: {
    left: cssVar("space-4"),
    right: cssVar("space-4"),
    bottom: "calc(4.5rem + env(safe-area-inset-bottom, 0px))",
  },
};

const FLOATING_PANEL_SHAPE_STYLES: Record<FloatingPanelShape, CSSProperties> = {
  card: { borderRadius: cssVar("radius-lg") },
  pill: { borderRadius: cssVar("radius-full") },
};

const FLOATING_PANEL_TONE_STYLES: Record<FloatingPanelTone, CSSProperties> = {
  surface: { background: cssVar("color-surface") },
  inverse: {
    background: cssVar("color-dark-chip"),
    color: cssVar("color-dark-chip-fg"),
    borderColor: cssVar("color-dark-chip"),
  },
};

export const floatingPanelStyle = (
  placement: FloatingPanelPlacement,
  shape: FloatingPanelShape,
  tone: FloatingPanelTone,
): CSSProperties => ({
  ...FLOATING_PANEL_BASE_STYLE,
  ...FLOATING_PANEL_PLACEMENT_STYLES[placement],
  ...FLOATING_PANEL_SHAPE_STYLES[shape],
  ...FLOATING_PANEL_TONE_STYLES[tone],
});
