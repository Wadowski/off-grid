// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const adminPageStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[4],
  maxWidth: "40rem",
  minWidth: 0,
};

export const adminSectionStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[3],
  minWidth: 0,
};

export const adminPersonRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: tokens.space[2],
  paddingBlock: tokens.space[2],
  borderBottom: `1px solid ${cssVar("color-border")}`,
  minWidth: 0,
};

export const adminPersonMetaStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[1],
  minWidth: 0,
  overflowWrap: "anywhere",
};

export const adminActionsStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: tokens.space[2],
};
