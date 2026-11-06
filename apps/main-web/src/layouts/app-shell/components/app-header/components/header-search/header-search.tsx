// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text, TextField, VisuallyHidden } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { MaterialIcon } from "../../../../../../icons/material-icon/material-icon.js";

export const HeaderSearch = () => {
  const { t } = useTranslation();

  return (
    <div className="og-header-search">
      <TextField
        type="search"
        disabled
        placeholder={t("shell.searchPlaceholder")}
        label={
          <VisuallyHidden>
            <Text variant="label" textId="shell.searchPlaceholder" />
          </VisuallyHidden>
        }
        leading={<MaterialIcon name="search" size="18px" color="currentColor" />}
        trailing={<Text variant="caption" value="⌘K" />}
      />
    </div>
  );
};
