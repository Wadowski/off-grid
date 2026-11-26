// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const loadingPhoneRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "2.5rem minmax(0, 1fr)",
  alignItems: "center",
  gap: tokens.space[3],
  minHeight: "3.5rem",
  padding: `${tokens.space[2]} ${tokens.space[3]}`,
};

export const loadingPhoneRowTextStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[1],
  minWidth: 0,
};
