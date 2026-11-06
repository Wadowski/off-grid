// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { MaterialIcon } from "../../../../../../icons/material-icon/material-icon.js";

export const HeaderSearch = () => {
  const { t } = useTranslation();

  return (
    <div className="og-header-search">
      <span className="og-header-search-icon" aria-hidden="true">
        <MaterialIcon name="search" size="18px" color="currentColor" />
      </span>
      <input
        className="og-header-search-input"
        type="search"
        disabled
        placeholder={t("shell.searchPlaceholder")}
        aria-label={t("shell.searchPlaceholder")}
      />
      <span className="og-header-search-shortcut" aria-hidden="true">
        <Text variant="caption" value="⌘K" />
      </span>
    </div>
  );
};
