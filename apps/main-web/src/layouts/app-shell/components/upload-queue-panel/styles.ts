// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CSSProperties } from "react";
import { cssVar } from "@offgrid/ui";

export const uploadQueuePanelListStyle: CSSProperties = {
  padding: `0 ${cssVar("space-4")} ${cssVar("space-4")}`,
  maxHeight: "min(50vh, 24rem)",
  overflowY: "auto",
};
