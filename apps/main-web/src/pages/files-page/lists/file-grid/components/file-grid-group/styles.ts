// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const fileGridGroupStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(10rem, 1fr))",
  gap: tokens.space[3],
  minWidth: 0,
};

export const fileGridGroupItemStyle: CSSProperties = {
  minWidth: 0,
};
