// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CSSProperties } from "react";
import { cssVar } from "@offgrid/ui";

export const uploadQueueRowStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: cssVar("space-2"),
  padding: cssVar("space-7"),
  borderRadius: cssVar("radius-lg"),
  background: cssVar("color-surface-low"),
  minWidth: 0,
};

export const uploadQueueRowTopStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: cssVar("space-3"),
  minWidth: 0,
};

export const uploadQueueRowNameStyle: CSSProperties = {
  flex: "1 1 8rem",
  minWidth: "8rem",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  margin: 0,
};
