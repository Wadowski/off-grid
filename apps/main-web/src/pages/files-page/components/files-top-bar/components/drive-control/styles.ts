// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CSSProperties } from "react";

export const driveControlTextStyle: CSSProperties = {
  display: "grid",
  flex: "1 1 auto",
  minWidth: 0,
};

export const driveControlNameStyle: CSSProperties = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  minWidth: 0,
};
