// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const formStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[3],
  minWidth: 0,
};

export const actionRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: tokens.space[2],
};

export const actionBlockStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[2],
  paddingTop: tokens.space[1],
};

export const promptStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: tokens.space[1],
  color: cssVar("color-muted"),
};

export const errorBannerStyle: CSSProperties = {
  marginTop: tokens.space[2],
};

export const pickerSectionStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[2],
  textAlign: "left",
};
