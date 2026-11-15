// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const guestOptionsStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[2],
};

export const guestFamilyNameStyle: CSSProperties = {
  color: cssVar("color-muted"),
  fontSize: tokens.font.size["label-sm"],
  lineHeight: tokens.font.lineHeight["label-sm"],
};
