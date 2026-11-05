// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

const cssColor = (name: string): string => `var(--og-color-${name})`;

export const createAccountPromptStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: tokens.space[1],
  paddingTop: tokens.space[2],
  color: cssColor("muted"),
};

export const createAccountLinkStyle: CSSProperties = {
  color: cssColor("primary"),
  textDecoration: "none",
};
