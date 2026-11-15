// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const dividerColor = (percent: number): string =>
  `color-mix(in srgb, ${cssVar("color-line")} ${percent}%, transparent)`;

export const eventDialogStyle = (narrow: boolean): CSSProperties =>
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
        border: `1px solid ${dividerColor(60)}`,
        borderRadius: tokens.radius.lg,
        background: cssVar("color-surface"),
        boxShadow: tokens.elevation[2],
        padding: 0,
        overflow: "hidden",
      };

export const eventDialogShellStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
  maxHeight: "inherit",
};

export const eventDialogFooterStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: tokens.space[3],
  padding: `${tokens.space[3]} ${tokens.space[5]}`,
  borderTop: `1px solid ${dividerColor(60)}`,
};
