// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CSSProperties } from "react";
import { cssVar } from "@offgrid/ui";

export const uploadQueueRowStatusStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: cssVar("space-1"),
  flexShrink: 0,
};
