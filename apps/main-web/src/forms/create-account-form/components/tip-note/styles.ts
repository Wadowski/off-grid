// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const tipNoteStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: tokens.space[1],
  padding: tokens.space[2],
  borderRadius: tokens.radius.md,
  border: "1px solid var(--og-color-line)",
  background: "var(--og-color-surface-low)",
  color: "var(--og-color-muted)",
};
