// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const accessSectionStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[2],
  minWidth: 0,
};

export const accessListStyle: CSSProperties = {
  display: "grid",
  margin: 0,
  padding: 0,
  listStyle: "none",
  minWidth: 0,
};

export const accessStatusStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[2],
  justifyItems: "start",
  color: cssVar("color-muted"),
};
