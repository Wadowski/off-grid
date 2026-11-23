// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";

export const NOTIFICATIONS_POPOVER_TITLE_ID = "notifications-popover-title";
export const NOTIFICATIONS_POPOVER_WIDTH = tokens.size.popover;
export const NOTIFICATIONS_POPOVER_TOP = `calc(${tokens.size.header} + ${tokens.space[2]})`;
export const NOTIFICATIONS_POPOVER_GUTTER = tokens.size.popoverGutter;
export const NOTIFICATIONS_POPOVER_MAX_WIDTH = `calc(100vw - 2 * ${NOTIFICATIONS_POPOVER_GUTTER})`;
export const NOTIFICATIONS_POPOVER_MAX_LIST_HEIGHT = tokens.size.popoverListMax;
export const NOTIFICATIONS_POPOVER_LIMIT = 5;
