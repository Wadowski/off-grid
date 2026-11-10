// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const familyMemberRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: tokens.space[3],
  padding: tokens.space[3],
  borderTop: `1px solid ${cssVar("color-line")}`,
};

export const familyMemberIdentityStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[3],
  minWidth: 0,
};

export const familyMemberNameStyle: CSSProperties = {
  display: "grid",
  minWidth: 0,
};

export const familyMemberNameLineStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: tokens.space[2],
};

export const familyMemberActionsStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: tokens.space[2],
};
