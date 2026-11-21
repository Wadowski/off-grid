// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const folderNotFoundStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[3],
  justifyItems: "start",
  padding: tokens.space[4],
  minWidth: 0,
};
