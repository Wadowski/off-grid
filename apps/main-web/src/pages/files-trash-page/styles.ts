// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const trashPageStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[3],
  minWidth: 0,
};

export const trashEmptyStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[1],
  padding: `${tokens.space[6]} 0`,
  outline: "none",
};

export const trashErrorActionStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[2],
  justifyItems: "start",
};

export const trashRowActionsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: tokens.space[2],
};

export const trashHeaderRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: tokens.space[2],
};
