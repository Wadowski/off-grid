// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const familiesPageStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[4],
};

export const narrowCardPageStyle: CSSProperties = {
  ...familiesPageStyle,
  maxWidth: "30rem",
  minWidth: 0,
  marginInline: "auto",
  textAlign: "center",
};
