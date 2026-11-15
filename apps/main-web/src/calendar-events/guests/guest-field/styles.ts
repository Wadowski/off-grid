// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const guestFieldStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[3],
  padding: tokens.space[3],
  borderRadius: tokens.radius.lg,
  background: cssVar("color-surface-low"),
};

export const guestChipsStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: tokens.space[2],
};

export const guestChipStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: tokens.space[1],
  padding: `${tokens.space[1]} ${tokens.space[2]}`,
  borderRadius: tokens.radius.full,
  background: cssVar("color-surface"),
};
