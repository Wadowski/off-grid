// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const pdfPreviewerStyle: CSSProperties = {
  display: "block",
  width: "100%",
  height: "75vh",
  border: "none",
};

export const pdfUnavailableStyle: CSSProperties = {
  display: "grid",
  justifyItems: "start",
  gap: tokens.space[3],
};
