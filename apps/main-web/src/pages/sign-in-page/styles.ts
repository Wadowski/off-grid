// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const createAccountPromptStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: tokens.space[1],
  paddingTop: tokens.space[2],
  color: cssVar("color-muted"),
};

export const createAccountLinkStyle: CSSProperties = {
  color: cssVar("color-primary"),
  textDecoration: "none",
};
