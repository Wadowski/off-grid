// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const nameEmailRowStyle = (narrow: boolean): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: narrow ? "minmax(0, 1fr)" : "repeat(2, minmax(0, 1fr))",
  gap: narrow ? tokens.space[3] : tokens.space[2],
});

export const errorBannerStyle: CSSProperties = {
  marginTop: tokens.space[2],
};
