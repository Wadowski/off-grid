// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { MaterialIcon } from "../../../material-icon/material-icon.js";
import { Text } from "../../../text/text.js";
import { menuItemIconColor, menuItemStyle } from "./styles.js";
import type { MenuItemProps } from "./types.js";

export const MenuItem = ({ textId, icon, tone, testId, onSelect }: MenuItemProps) => (
  <button
    type="button"
    role="menuitem"
    tabIndex={-1}
    className="og-focusable"
    style={menuItemStyle(tone)}
    data-testid={testId}
    onClick={onSelect}
  >
    <MaterialIcon name={icon} size="1.25rem" color={menuItemIconColor(tone)} />
    <Text variant="action" textId={textId} />
  </button>
);
