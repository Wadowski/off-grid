// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const deletePanelStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[2],
  justifyItems: "end",
  textAlign: "left",
};

export const deleteActionsStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "flex-end",
  gap: tokens.space[2],
};
