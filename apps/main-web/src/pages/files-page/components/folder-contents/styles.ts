// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const folderContentsStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[3],
  minWidth: 0,
};

export const folderContentsListStyle: CSSProperties = {
  minWidth: 0,
  overflowX: "auto",
};
