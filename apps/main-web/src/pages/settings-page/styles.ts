// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const settingsPageStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[4],
  maxWidth: "40rem",
  minWidth: 0,
};

export const signOutRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "center",
};

export const signOutIconColor = cssVar("color-danger");
