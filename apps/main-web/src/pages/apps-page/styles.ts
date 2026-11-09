// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const appsPageStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[4],
  maxWidth: "40rem",
  minWidth: 0,
};

export const appsListStyle: CSSProperties = {
  display: "grid",
  overflow: "hidden",
  border: `1px solid ${cssVar("color-surface-high")}`,
  borderRadius: tokens.radius.lg,
  background: cssVar("color-surface"),
};
