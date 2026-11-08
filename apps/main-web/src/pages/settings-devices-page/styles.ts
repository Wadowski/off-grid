// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const settingsDeviceListStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[2],
  margin: 0,
  padding: 0,
  listStyle: "none",
};

export const settingsDeviceRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: tokens.space[3],
  padding: tokens.space[3],
  borderRadius: cssVar("radius-md"),
  border: `1px solid ${cssVar("color-line")}`,
  minWidth: 0,
};

export const settingsDevicesActionsStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: tokens.space[2],
};
