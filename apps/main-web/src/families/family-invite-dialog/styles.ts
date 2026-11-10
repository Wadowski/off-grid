// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const familyInviteDialogStyle: CSSProperties = {
  width: "min(30rem, calc(100vw - 2rem))",
  padding: tokens.space[5],
  border: `1px solid ${cssVar("color-line")}`,
  borderRadius: tokens.radius.lg,
  background: cssVar("color-surface"),
  color: cssVar("color-fg"),
};

export const familyInviteContentStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[3],
};

export const familyInviteCodeStyle: CSSProperties = {
  fontFamily: "monospace",
  fontSize: "1.25rem",
  letterSpacing: "0.08em",
  wordBreak: "break-all",
  padding: tokens.space[3],
  borderRadius: tokens.radius.md,
  background: cssVar("color-surface-low"),
};

export const familyInviteActionsStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "flex-end",
  gap: tokens.space[2],
};
