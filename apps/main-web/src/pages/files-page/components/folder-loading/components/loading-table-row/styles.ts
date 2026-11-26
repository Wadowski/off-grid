// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const loadingTableRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.25rem minmax(0, 1fr) 5rem 3.5rem",
  alignItems: "center",
  gap: tokens.space[3],
  minHeight: "2.75rem",
  padding: `${tokens.space[2]} ${tokens.space[3]}`,
};
