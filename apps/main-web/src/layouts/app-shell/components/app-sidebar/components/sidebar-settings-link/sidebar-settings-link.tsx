// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { NavLink } from "react-router-dom";
import { MaterialIcon } from "../../../../../../icons/material-icon/material-icon.js";
import { settingsNavItem } from "../../../../navigation.js";

export const SidebarSettingsLink = () => (
  <NavLink to={settingsNavItem.path ?? "/settings"} className="og-settings-link og-focusable">
    <MaterialIcon name={settingsNavItem.iconName} size="20px" color="currentColor" />
    <Text variant="label" textId={settingsNavItem.labelTextId} />
  </NavLink>
);
