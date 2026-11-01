// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { appNavItems } from "../../navigation.js";

export const AppNav = () => {
  const { t } = useTranslation();

  return (
    <nav aria-label={t("navLabel")} className="og-app-nav" data-testid="app-nav">
      {appNavItems.map((item) => (
        <NavLink key={item.id} to={item.path} end className="og-focusable">
          {t(item.labelTextId)}
        </NavLink>
      ))}
    </nav>
  );
};
