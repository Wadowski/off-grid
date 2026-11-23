// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const fileDetailsStatusStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[3],
  justifyItems: "start",
  minWidth: 0,
};

export const fileDetailsStatusLinkStyle: CSSProperties = {
  color: cssVar("color-primary"),
};
