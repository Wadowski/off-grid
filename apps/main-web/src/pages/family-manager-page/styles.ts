// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const familyManagerPageStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[3],
  width: "100%",
  minWidth: 0,
};

export const familyManagerHeaderStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: tokens.space[3],
};

export const familyManagerIntroStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[1],
  minWidth: 0,
};
