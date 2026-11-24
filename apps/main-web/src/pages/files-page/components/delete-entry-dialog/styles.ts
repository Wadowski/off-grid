// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

const dialogBorder = `1px solid ${cssVar("color-line")}`;

export const deleteEntryDialogStyle = (narrow: boolean): CSSProperties =>
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
        width: `min(${tokens.size.popover}, calc(100vw - 2rem))`,
        maxHeight: "calc(100vh - 3rem)",
        border: dialogBorder,
        borderRadius: tokens.radius.lg,
        background: cssVar("color-surface"),
        boxShadow: tokens.elevation[2],
        padding: 0,
        overflow: "hidden",
      };

export const deleteEntryShellStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
  maxHeight: "inherit",
};

export const deleteEntryTextStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[2],
  padding: `${tokens.space[5]} ${tokens.space[5]} 0`,
};

export const deleteEntryFooterStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: tokens.space[3],
  padding: `${tokens.space[3]} ${tokens.space[5]}`,
  borderTop: dialogBorder,
};
