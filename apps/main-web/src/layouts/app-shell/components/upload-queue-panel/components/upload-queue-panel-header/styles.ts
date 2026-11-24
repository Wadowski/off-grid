// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CSSProperties } from "react";
import { cssVar } from "@offgrid/ui";

export const uploadQueuePanelHeaderStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: cssVar("space-2"),
  padding: `${cssVar("space-3")} ${cssVar("space-4")}`,
  minWidth: 0,
};

export const uploadQueuePanelHeaderRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: cssVar("space-2"),
  minWidth: 0,
};

export const uploadQueuePanelHeaderTitleStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  margin: 0,
};

export const uploadQueuePanelHeaderActionsStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: cssVar("space-1"),
  flexShrink: 0,
};

export const uploadQueuePanelHeaderSummaryStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export const uploadQueuePanelPulseDotStyle: CSSProperties = {
  width: "0.5rem",
  height: "0.5rem",
  borderRadius: cssVar("radius-full"),
  background: cssVar("color-primary"),
  flexShrink: 0,
};

export const uploadQueuePanelInverseTextStyle: CSSProperties = {
  color: cssVar("color-dark-chip-fg"),
};
