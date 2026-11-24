// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const fileSummaryStyle: CSSProperties = {
  display: "grid",
  justifyItems: "start",
  gap: tokens.space[3],
  minWidth: 0,
};

export const fileSummaryNameStyle: CSSProperties = {
  maxWidth: "100%",
  minWidth: 0,
  overflowWrap: "anywhere",
};
