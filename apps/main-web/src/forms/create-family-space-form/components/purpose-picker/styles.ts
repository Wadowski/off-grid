// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const purposeGroupStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(7rem, 1fr))",
  gap: tokens.space[2],
};

export const purposeCardStyle = (selected: boolean): CSSProperties => ({
  padding: tokens.space[3],
  borderRadius: tokens.radius.lg,
  borderStyle: "solid",
  borderWidth: "1px",
  borderColor: selected ? cssVar("color-accent") : cssVar("color-line"),
  background: selected ? cssVar("color-accent-soft") : cssVar("color-surface"),
});

export const purposeOptionStyle: CSSProperties = {
  display: "grid",
  justifyItems: "center",
  gap: tokens.space[1],
  textAlign: "center",
};
