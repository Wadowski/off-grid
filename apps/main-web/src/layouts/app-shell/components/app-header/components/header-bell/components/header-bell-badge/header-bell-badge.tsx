// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { isBellCountOverflowing } from "../../is-bell-count-overflowing.js";
import { headerBellBadgeStyle } from "./styles.js";
import type { HeaderBellBadgeProps } from "./types.js";

export const HeaderBellBadge = ({ count }: HeaderBellBadgeProps) => (
  <span style={headerBellBadgeStyle} data-testid="header-bell-badge" aria-hidden="true">
    {isBellCountOverflowing(count) ? (
      <Text variant="label" textId="notifications.bell.unreadOverflow" />
    ) : (
      <Text variant="label" value={String(count)} />
    )}
  </span>
);
