// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CSSProperties } from "react";
import { PROGRESS_BAR_HEIGHT } from "../constants.js";
import { cssVar } from "../css-var.js";

export const progressTrackStyle: CSSProperties = {
  width: "100%",
  height: PROGRESS_BAR_HEIGHT,
  overflow: "hidden",
  borderRadius: cssVar("radius-full"),
  background: cssVar("color-surface-2"),
};

export const progressFillStyle = (percent: number): CSSProperties => ({
  width: `${percent}%`,
  height: "100%",
  borderRadius: cssVar("radius-full"),
  background: cssVar("color-accent"),
});
