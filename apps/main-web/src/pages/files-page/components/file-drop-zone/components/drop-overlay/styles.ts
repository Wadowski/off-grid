// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CSSProperties } from "react";
import { cssVar } from "@offgrid/ui";

export const dropOverlayLayerStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  zIndex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: cssVar("space-6"),
  background: `color-mix(in srgb, ${cssVar("color-surface")} 60%, transparent)`,
  backdropFilter: "blur(8px)",
  pointerEvents: "none",
};

export const dropOverlayTargetStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  width: "100%",
  maxWidth: "28rem",
  height: "100%",
  padding: cssVar("space-6"),
  borderRadius: cssVar("radius-lg"),
  border: `2px dashed ${cssVar("color-primary")}`,
  background: `color-mix(in srgb, ${cssVar("color-primary")} 5%, transparent)`,
};

export const dropOverlayIconTileStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "4rem",
  height: "4rem",
  marginBottom: cssVar("space-4"),
  borderRadius: cssVar("radius-lg"),
  background: cssVar("color-surface"),
  boxShadow: `${cssVar("elevation-2")}, 0 0 0 1px color-mix(in srgb, ${cssVar("color-primary")} 20%, transparent)`,
};

export const dropOverlayHintStyle: CSSProperties = {
  margin: `${cssVar("space-2")} 0 0`,
};

export const dropOverlayFolderNameStyle: CSSProperties = {
  fontWeight: 600,
  color: cssVar("color-fg"),
};
