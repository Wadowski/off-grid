// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const folderContentsStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[3],
  minWidth: 0,
};

export const folderContentsBodyStyle = (hasDetails: boolean): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: hasDetails ? `minmax(0, 1fr) ${tokens.size.detailsPanel}` : "minmax(0, 1fr)",
  alignItems: "start",
  gap: tokens.space[5],
  minWidth: 0,
});

export const folderContentsListStyle: CSSProperties = {
  minWidth: 0,
  overflowX: "auto",
};

export const folderContentsErrorStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[2],
  justifyItems: "start",
};
