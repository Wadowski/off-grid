// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const recoveryCodeStepStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[4],
};

export const recoveryCodeBoxStyle: CSSProperties = {
  padding: tokens.space[4],
  borderRadius: tokens.radius.md,
  background: "var(--og-color-surface-2)",
  overflowWrap: "anywhere",
};

export const checkboxLabelStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[2],
};
