// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const fileNotFoundStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[3],
  justifyItems: "start",
  padding: tokens.space[4],
  minWidth: 0,
};

export const fileNotFoundLinkStyle: CSSProperties = {
  color: cssVar("color-primary"),
};
