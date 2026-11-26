// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const folderEmptyStyle: CSSProperties = {
  display: "grid",
  justifyItems: "center",
  gap: tokens.space[2],
  padding: `${tokens.space[6]} ${tokens.space[4]}`,
  textAlign: "center",
  minWidth: 0,
};

export const folderEmptyIconColors = {
  background: cssVar("color-file-folder-soft"),
  color: cssVar("color-file-folder"),
} as const;
