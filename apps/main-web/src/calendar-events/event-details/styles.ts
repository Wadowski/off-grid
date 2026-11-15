// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const detailsDialogStyle = (narrow: boolean): CSSProperties =>
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

export const detailsShellStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
  maxHeight: "inherit",
};

export const detailsHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: tokens.space[3],
  padding: `${tokens.space[3]} ${tokens.space[4]}`,
};

export const detailsActionsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[2],
};

export const detailsBodyStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[3],
  padding: `0 ${tokens.space[5]} ${tokens.space[5]}`,
  overflowY: "auto",
  minHeight: 0,
};

export const detailsCardStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[1],
  padding: tokens.space[4],
  borderRadius: tokens.radius.lg,
  background: cssVar("color-surface-low"),
};

export const detailsRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[2],
  flexWrap: "wrap",
};

export const detailsFooterStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: tokens.space[3],
  padding: `${tokens.space[3]} ${tokens.space[5]}`,
  borderTop: `1px solid color-mix(in srgb, ${cssVar("color-line")} 60%, transparent)`,
};

export const detailsPageStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  minHeight: "100dvh",
  background: cssVar("color-surface"),
};

export const detailsAppBarStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[2],
  padding: `${tokens.space[3]} ${tokens.space[4]}`,
};

export const detailsPhoneBodyStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[3],
  padding: `0 ${tokens.space[4]} ${tokens.space[4]}`,
  flex: 1,
};

export const detailsPhoneActionRowStyle: CSSProperties = {
  display: "flex",
  gap: tokens.space[2],
  padding: `${tokens.space[3]} ${tokens.space[4]}`,
  borderTop: `1px solid color-mix(in srgb, ${cssVar("color-line")} 60%, transparent)`,
};

export const detailsStatusStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: tokens.space[3],
  padding: tokens.space[5],
};

export const detailsCalendarChipStyle = (accent: string | undefined): CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: tokens.space[2],
  padding: `${tokens.space[1]} ${tokens.space[3]}`,
  borderRadius: tokens.radius.full,
  background: cssVar("color-surface-high"),
  color: accent ?? cssVar("color-fg"),
});

export const detailsDotStyle = (accent: string | undefined): CSSProperties => ({
  width: "8px",
  height: "8px",
  borderRadius: "999px",
  background: accent ?? cssVar("color-primary"),
});

export const detailsNotesStyle: CSSProperties = {
  whiteSpace: "pre-wrap",
  margin: 0,
};

export const deleteConfirmTextStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[2],
  padding: `${tokens.space[5]} ${tokens.space[5]} 0`,
};
