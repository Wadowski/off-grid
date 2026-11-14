// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const newEventIconTileBackground = `color-mix(in srgb, ${cssVar("color-primary")} 12%, transparent)`;

export const newEventDialogStyle = (narrow: boolean): CSSProperties =>
  narrow
    ? {
        width: "100vw",
        maxWidth: "100vw",
        height: "100dvh",
        maxHeight: "100dvh",
        border: "none",
        borderRadius: 0,
        background: cssVar("color-surface"),
        padding: 0,
        overflow: "hidden",
      }
    : {
        width: "min(624px, calc(100vw - 2rem))",
        maxHeight: "calc(100vh - 3rem)",
        border: `1px solid color-mix(in srgb, ${cssVar("color-line")} 60%, transparent)`,
        borderRadius: tokens.radius.lg,
        background: cssVar("color-surface"),
        boxShadow: tokens.elevation[2],
        padding: 0,
        overflow: "hidden",
      };

export const newEventFormStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
  maxHeight: "inherit",
};

export const newEventHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: tokens.space[2],
  padding: `${tokens.space[4]} ${tokens.space[5]}`,
  borderBottom: `1px solid color-mix(in srgb, ${cssVar("color-line")} 40%, transparent)`,
};

export const newEventTitleGroupStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[2],
  minWidth: 0,
};

export const newEventHeadingStyle: CSSProperties = {
  margin: 0,
  fontSize: tokens.font.size["headline-sm"],
  lineHeight: tokens.font.lineHeight["headline-sm"],
  letterSpacing: tokens.font.letterSpacing["headline-sm"],
  fontWeight: tokens.font.weight.semibold,
};

export const newEventHeaderActionsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[2],
};

export const newEventBodyStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[3],
  padding: `${tokens.space[4]} ${tokens.space[5]}`,
  overflowY: "auto",
  minHeight: 0,
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

export const newEventTitleCardStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[1],
  padding: `${tokens.space[2]} ${tokens.space[3]}`,
  borderRadius: tokens.radius.lg,
  background: cssVar("color-surface-low"),
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

export const newEventErrorStyle: CSSProperties = {
  margin: 0,
};

export const newEventFooterStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: tokens.space[2],
  padding: `${tokens.space[3]} ${tokens.space[5]}`,
  borderTop: `1px solid color-mix(in srgb, ${cssVar("color-line")} 40%, transparent)`,
  background: cssVar("color-surface-low"),
};

export const newEventActionsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[2],
  marginLeft: "auto",
};
