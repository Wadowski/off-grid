// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const familyManagerPageStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[4],
  width: "100%",
  maxWidth: "48rem",
  minWidth: 0,
  marginInline: "auto",
};

export const familyManagerActionsStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "flex-end",
  gap: tokens.space[2],
};
