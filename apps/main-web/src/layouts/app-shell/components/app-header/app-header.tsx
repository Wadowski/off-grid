// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { appHeaderStyle } from "./styles.js";

export const AppHeader = () => {
  const { t } = useTranslation();

  return (
    <header style={appHeaderStyle}>
      <Text variant="brand" textId="appName" />
      <nav aria-label={t("navLabel")} data-testid="app-nav">
        <Text variant="status" textId="navPlaceholder" />
      </nav>
    </header>
  );
};
