// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { MaterialIcon, Text } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { mobileTabItems } from "../../navigation.js";

export const MobileTabBar = () => {
  const { t } = useTranslation();

  return (
    <nav aria-label={t("navLabel")} className="og-tab-bar" data-testid="mobile-tab-bar">
      {mobileTabItems.map((item) => (
        <NavLink key={item.id} to={item.path ?? "/"} end className="og-tab-bar-item og-focusable">
          <MaterialIcon name={item.iconName} size="24px" color="currentColor" />
          <Text variant="label" textId={item.labelTextId} />
        </NavLink>
      ))}
    </nav>
  );
};
