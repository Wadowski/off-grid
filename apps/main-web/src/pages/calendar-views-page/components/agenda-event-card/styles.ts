// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const agendaRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: tokens.space[2],
  minWidth: 0,
};

export const agendaTimeColumnStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  flexShrink: 0,
  width: "3.5rem",
  paddingTop: tokens.space[3],
  textAlign: "right",
};

export const agendaClockStyle: CSSProperties = {
  fontFamily: cssVar("font-family-mono"),
  fontSize: cssVar("font-size-mono-code"),
  lineHeight: cssVar("line-height-mono-code"),
  letterSpacing: cssVar("letter-spacing-mono-code"),
  fontWeight: cssVar("font-weight-semibold"),
  color: cssVar("color-fg"),
};

export const agendaMeridiemStyle: CSSProperties = {
  fontFamily: cssVar("font-family-base"),
  fontSize: cssVar("font-size-label-sm"),
  lineHeight: cssVar("line-height-label-sm"),
  color: cssVar("color-muted"),
};

export const agendaCardStyle: CSSProperties = {
  position: "relative",
  flex: "1 1 0",
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[1],
  padding: tokens.space[3],
  borderRadius: cssVar("radius-lg"),
  background: cssVar("color-surface"),
  boxShadow: cssVar("elevation-1"),
  overflow: "hidden",
};

export const agendaAccentBarStyle = (color: string): CSSProperties => ({
  position: "absolute",
  top: 0,
  bottom: 0,
  left: 0,
  width: "6px",
  background: color,
});

export const agendaCardHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[2],
  minWidth: 0,
  paddingLeft: tokens.space[1],
};

export const agendaCalendarPillStyle = (color: string): CSSProperties => ({
  maxWidth: "100%",
  padding: `${tokens.space[1]} ${tokens.space[2]}`,
  borderRadius: cssVar("radius-full"),
  background: `${color}26`,
  color: cssVar("color-fg"),
  fontFamily: cssVar("font-family-base"),
  fontSize: cssVar("font-size-label-sm"),
  lineHeight: cssVar("line-height-label-sm"),
  fontWeight: cssVar("font-weight-medium"),
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const agendaDurationStyle: CSSProperties = {
  flexShrink: 0,
  fontFamily: cssVar("font-family-base"),
  fontSize: cssVar("font-size-label-sm"),
  lineHeight: cssVar("line-height-label-sm"),
  color: cssVar("color-muted"),
};

export const agendaCardBodyStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[1],
  paddingLeft: tokens.space[1],
  minWidth: 0,
};

export const agendaCardFooterStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: tokens.space[2],
  paddingLeft: tokens.space[1],
  minWidth: 0,
};

export const agendaEndStyle: CSSProperties = {
  flexShrink: 0,
  fontFamily: cssVar("font-family-base"),
  fontSize: cssVar("font-size-label-sm"),
  lineHeight: cssVar("line-height-label-sm"),
  fontWeight: cssVar("font-weight-medium"),
  color: cssVar("color-primary"),
};
