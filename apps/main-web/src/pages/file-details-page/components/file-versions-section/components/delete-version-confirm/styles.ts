// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const deleteVersionConfirmBodyStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[3],
  padding: tokens.space[4],
  minWidth: 0,
};

export const deleteVersionConfirmActionsStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "flex-end",
  gap: tokens.space[2],
};
