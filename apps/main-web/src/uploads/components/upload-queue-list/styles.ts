// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CSSProperties } from "react";
import { cssVar } from "@offgrid/ui";

export const uploadQueueListStyle: CSSProperties = {
  listStyle: "none",
  margin: 0,
  padding: 0,
  display: "flex",
  flexDirection: "column",
  gap: cssVar("space-2"),
};

export const uploadQueueListFooterStyle: CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  marginTop: cssVar("space-2"),
};
