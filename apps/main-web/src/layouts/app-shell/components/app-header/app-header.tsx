// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import markUrl from "../../../../media/offgrid-mark-64.png";
import { MaterialIcon } from "../../../../icons/material-icon/material-icon.js";
import { HeaderSearch } from "./components/header-search/header-search.js";

export const AppHeader = () => {
  const { t } = useTranslation();

  return (
    <header className="og-header">
      <div className="og-header-start">
        <img className="og-header-brand" src={markUrl} alt="" aria-hidden="true" />
        <HeaderSearch />
      </div>
      <div className="og-header-actions">
        <span className="og-header-pill">
          <MaterialIcon name="sync_saved_locally" size="16px" color="currentColor" />
          <Text variant="label" textId="shell.privateNode" />
        </span>
        <button
          type="button"
          className="og-header-icon-button og-focusable"
          aria-label={t("shell.notifications")}
          disabled
        >
          <MaterialIcon name="notifications" size="20px" color="currentColor" />
        </button>
        <button
          type="button"
          className="og-header-icon-button og-header-apps og-focusable"
          aria-label={t("shell.apps")}
          disabled
        >
          <MaterialIcon name="apps" size="20px" color="currentColor" />
        </button>
      </div>
    </header>
  );
};
