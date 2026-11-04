// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

const cssColor = (name: string): string => `var(--og-color-${name})`;

export const formStyle = (narrow: boolean): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  gap: narrow ? tokens.space[3] : tokens.space[3],
  minWidth: 0,
});

export const nameEmailRowStyle = (narrow: boolean): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: narrow ? "minmax(0, 1fr)" : "repeat(2, minmax(0, 1fr))",
  gap: narrow ? tokens.space[3] : tokens.space[2],
});

export const submitBlockStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[2],
  paddingTop: tokens.space[1],
};

export const signInPromptStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: tokens.space[1],
  color: cssColor("muted"),
};

export const errorBannerStyle: CSSProperties = {
  marginTop: tokens.space[2],
};
