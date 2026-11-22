// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const folderListStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[3],
  minWidth: 0,
};

export const folderListItemsStyle: CSSProperties = {
  display: "grid",
  margin: 0,
  padding: 0,
  listStyle: "none",
  minWidth: 0,
};

export const folderListRowStyle: CSSProperties = {
  minWidth: 0,
};
