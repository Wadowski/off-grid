// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";
import type { FolderLoadingLayout } from "./types.js";

const listStyle: CSSProperties = {
  display: "grid",
  minWidth: 0,
};

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(10rem, 1fr))",
  gap: tokens.space[3],
};

export const folderLoadingStyleFor = (layout: FolderLoadingLayout): CSSProperties =>
  layout === "grid" ? gridStyle : listStyle;
