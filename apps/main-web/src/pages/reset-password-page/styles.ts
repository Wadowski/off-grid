// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const noticeStyle: CSSProperties = {
  padding: tokens.space[3],
  borderRadius: tokens.radius.lg,
  background: cssVar("color-surface-low"),
};
