// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const newEventTitleCardStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[1],
  padding: `${tokens.space[2]} ${tokens.space[3]}`,
  borderRadius: tokens.radius.lg,
  background: cssVar("color-surface-low"),
};

export const newEventGroupStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[3],
  padding: tokens.space[3],
  borderRadius: tokens.radius.lg,
  background: cssVar("color-surface-low"),
};

export const newEventGroupHeadStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: tokens.space[2],
};

export const newEventGroupTitleStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[2],
  fontSize: tokens.font.size["label-md"],
  lineHeight: tokens.font.lineHeight["label-md"],
  fontWeight: tokens.font.weight.semibold,
};

export const newEventTimesStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(11rem, 1fr))",
  gap: tokens.space[3],
};

export const newEventZoneStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[1],
  fontSize: tokens.font.size["label-sm"],
  lineHeight: tokens.font.lineHeight["label-sm"],
  color: cssVar("color-muted"),
};

export const newEventLabelRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[1],
};

export const newEventColumnStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[1],
};

export const newEventTimeErrorStyle: CSSProperties = {
  margin: 0,
};
