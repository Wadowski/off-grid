// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const filePreviewBodyStyle: CSSProperties = {
  overflow: "auto",
  minWidth: 0,
  padding: tokens.space[4],
};

export const filePreviewStatusStyle: CSSProperties = {
  display: "grid",
  justifyItems: "start",
  gap: tokens.space[3],
};
