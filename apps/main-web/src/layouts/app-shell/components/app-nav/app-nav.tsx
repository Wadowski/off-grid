// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { appNavItems } from "../../navigation.js";
import { AppNavLabel } from "./components/app-nav-label/app-nav-label.js";

export const AppNav = () => {
  const { t } = useTranslation();

  return (
    <nav aria-label={t("navLabel")} className="og-app-nav" data-testid="app-nav">
      {appNavItems.map((item) =>
        item.path === undefined ? (
          <span
            key={item.id}
            className="og-app-nav-item og-app-nav-item-disabled"
            aria-disabled="true"
          >
            <AppNavLabel item={item} />
          </span>
        ) : (
          <NavLink
            key={item.id}
            to={item.path}
            end
            className={
              item.mobileOnly
                ? "og-app-nav-item og-app-nav-item-mobile-only og-focusable"
                : "og-app-nav-item og-focusable"
            }
          >
            <AppNavLabel item={item} />
          </NavLink>
        ),
      )}
    </nav>
  );
};
