// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";
import { notificationsSurfaceTitleRowStyle } from "../../../notifications-surface/styles.js";

export const notificationsPopoverHeaderStyle: CSSProperties = {
  ...notificationsSurfaceTitleRowStyle,
  padding: `${tokens.space[3]} ${tokens.space[4]} 0`,
};
