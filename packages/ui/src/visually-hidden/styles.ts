// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CSSProperties } from "react";

export const visuallyHiddenStyle: CSSProperties = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clipPath: "inset(50%)",
  whiteSpace: "nowrap",
  borderWidth: 0,
};
