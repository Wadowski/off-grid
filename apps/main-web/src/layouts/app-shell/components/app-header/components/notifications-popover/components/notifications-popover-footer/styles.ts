// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const notificationsPopoverFooterStyle: CSSProperties = {
  padding: tokens.space[4],
  borderTop: `1px solid ${cssVar("color-surface-high")}`,
  background: cssVar("color-surface-low"),
};
