// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

const cssColor = (name: string): string => `var(--og-color-${name})`;

export const accountIntroStyle = (narrow: boolean): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  alignItems: narrow ? "flex-start" : "center",
  textAlign: narrow ? "left" : "center",
  marginBottom: narrow ? tokens.space[4] : tokens.space[5],
  color: cssColor("fg"),
});

export const iconWrapStyle: CSSProperties = {
  position: "relative",
  marginBottom: tokens.space[3],
};

export const iconBlockStyle: CSSProperties = {
  width: "3.5rem",
  height: "3.5rem",
  borderRadius: "1rem",
  background: cssColor("surface-low"),
  boxShadow: tokens.elevation[1],
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export const badgeStyle: CSSProperties = {
  position: "absolute",
  right: "-0.25rem",
  bottom: "-0.25rem",
  width: "1.25rem",
  height: "1.25rem",
  borderRadius: tokens.radius.full,
  background: cssColor("good"),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: tokens.elevation[1],
};

export const pillStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: tokens.space[1],
  padding: "0.125rem " + tokens.space[2],
  borderRadius: tokens.radius.full,
  background: cssColor("surface-high"),
  color: cssColor("muted"),
  marginBottom: tokens.space[1],
};

export const pillDotStyle: CSSProperties = {
  width: "0.375rem",
  height: "0.375rem",
  borderRadius: tokens.radius.full,
  background: cssColor("primary"),
};

export const introHeadingStyle: CSSProperties = {
  marginTop: tokens.space[1],
};

export const introBodyStyle = (narrow: boolean): CSSProperties => ({
  margin: `${tokens.space[1]} 0 0`,
  maxWidth: narrow ? "none" : "24rem",
  color: cssColor("muted"),
});
