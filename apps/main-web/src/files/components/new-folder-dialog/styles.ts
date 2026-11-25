// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const newFolderDialogStyle: CSSProperties = {
  width: "min(30rem, calc(100vw - 2rem))",
  padding: tokens.space[5],
  border: `1px solid ${cssVar("color-line")}`,
  borderRadius: tokens.radius.lg,
  background: cssVar("color-surface"),
};

export const newFolderDialogContentStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[4],
};
