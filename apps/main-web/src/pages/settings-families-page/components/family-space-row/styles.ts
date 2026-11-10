// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const familySpaceRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: tokens.space[3],
  padding: tokens.space[3],
  borderRadius: tokens.radius.lg,
  background: cssVar("color-surface"),
  borderStyle: "solid",
  borderWidth: "1px",
  borderColor: cssVar("color-line"),
};

export const familySpaceIdentityStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[3],
  minWidth: 0,
};

export const familySpaceActionsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[2],
};
