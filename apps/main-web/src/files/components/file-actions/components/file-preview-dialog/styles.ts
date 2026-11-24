// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const filePreviewDialogStyle: CSSProperties = {
  width: "min(60rem, calc(100vw - 2rem))",
  maxWidth: "100%",
  minHeight: "min(30rem, calc(100vh - 2rem))",
  maxHeight: "calc(100vh - 2rem)",
  padding: 0,
  border: "none",
  borderRadius: cssVar("radius-lg"),
  background: cssVar("color-surface"),
};

export const filePreviewDialogContentStyle: CSSProperties = {
  display: "grid",
  minWidth: 0,
};

export const filePreviewDownloadErrorStyle: CSSProperties = {
  margin: 0,
  padding: `${tokens.space[2]} ${tokens.space[4]} 0`,
};
