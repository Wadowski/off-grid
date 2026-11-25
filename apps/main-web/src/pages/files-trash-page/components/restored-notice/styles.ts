// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const restoredNoticeStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: tokens.space[3],
  minWidth: 0,
  padding: `${tokens.space[2]} ${tokens.space[3]}`,
  borderRadius: tokens.radius.md,
  background: cssVar("color-surface-low"),
  color: cssVar("color-fg"),
};

export const restoredNoticeActionsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[2],
};
