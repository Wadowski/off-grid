// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const updateConfirmDialogStyle: CSSProperties = {
  width: "min(28rem, calc(100vw - 2rem))",
  maxWidth: "100%",
  padding: 0,
  border: "none",
  borderRadius: cssVar("radius-lg"),
};

export const updateConfirmTextStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[2],
  padding: tokens.space[5],
};

export const updateConfirmFooterStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: tokens.space[3],
  padding: `0 ${tokens.space[5]} ${tokens.space[5]}`,
};
