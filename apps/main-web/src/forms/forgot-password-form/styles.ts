// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const methodChoiceStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[2],
  margin: 0,
  padding: 0,
  border: 0,
  minWidth: 0,
};

export const methodLegendStyle: CSSProperties = {
  padding: 0,
  marginBottom: tokens.space[1],
};

export const methodOptionStyle = (selected: boolean): CSSProperties => ({
  display: "flex",
  alignItems: "flex-start",
  gap: tokens.space[2],
  padding: tokens.space[3],
  borderRadius: tokens.radius.lg,
  border: `1px solid ${selected ? "var(--og-color-primary)" : cssVar("color-muted")}`,
  background: cssVar("color-surface-low"),
  cursor: "pointer",
});

export const methodOptionHintStyle: CSSProperties = {
  color: cssVar("color-muted"),
};

export const helpStyle: CSSProperties = {
  color: cssVar("color-muted"),
  textAlign: "center",
};
