// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const calendarStateStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[3],
  justifyItems: "center",
  maxWidth: "30rem",
  marginInline: "auto",
  textAlign: "center",
};
