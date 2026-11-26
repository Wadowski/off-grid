// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const folderLoadFailedStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[2],
  justifyItems: "start",
  padding: `${tokens.space[4]} 0`,
  minWidth: 0,
};
