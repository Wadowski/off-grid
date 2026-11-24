// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const tabLabelStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: tokens.space[2],
};

export const tabCountStyle: CSSProperties = {
  minWidth: "1.5rem",
  padding: `0 ${tokens.space[1]}`,
  borderRadius: cssVar("radius-full"),
  background: cssVar("color-accent-soft"),
  color: cssVar("color-accent"),
  textAlign: "center",
};
