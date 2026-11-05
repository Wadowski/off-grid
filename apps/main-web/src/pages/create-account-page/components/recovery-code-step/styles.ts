// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

const cssColor = (name: string): string => `var(--og-color-${name})`;

export const recoveryCodeStepStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[3],
  color: cssColor("fg"),
};

export const recoveryCodeBoxStyle: CSSProperties = {
  padding: tokens.space[4],
  borderRadius: tokens.radius.lg,
  background: cssColor("surface-low"),
  overflowWrap: "anywhere",
};

export const saveBlockStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[2],
  paddingTop: tokens.space[1],
};

export const checkboxLabelStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[2],
  padding: tokens.space[2],
  borderRadius: tokens.radius.md,
  background: cssColor("surface-low"),
  cursor: "pointer",
};
