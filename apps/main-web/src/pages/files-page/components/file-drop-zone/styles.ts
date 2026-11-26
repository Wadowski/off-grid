// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CSSProperties } from "react";
import { cssVar } from "@offgrid/ui";

export const fileDropZoneStyle: CSSProperties = {
  position: "relative",
  overflow: "hidden",
  borderRadius: cssVar("radius-lg"),
  minWidth: 0,
};

export const fileDropZoneContentStyle: CSSProperties = {
  minWidth: 0,
};

export const fileDropZoneDimmedContentStyle: CSSProperties = {
  ...fileDropZoneContentStyle,
  filter: "blur(2px)",
  opacity: 0.4,
  pointerEvents: "none",
};

export const fileDropZoneAnimatedContentStyle: CSSProperties = {
  transition: "filter 300ms ease-in-out, opacity 300ms ease-in-out",
};
