// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";
import { dividerColor } from "../../styles.js";

export const newEventFooterStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: tokens.space[2],
  padding: `${tokens.space[3]} ${tokens.space[5]}`,
  borderTop: `1px solid ${dividerColor(40)}`,
  background: cssVar("color-surface-low"),
};

export const newEventActionsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[2],
  marginLeft: "auto",
};
