// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, MaterialIcon } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { topBarActionsStyle } from "./styles.js";

export const TopBarActions = () => {
  const { t } = useTranslation();

  return (
    <div
      role="group"
      aria-label={t("files.topBar.actionsLabel")}
      style={topBarActionsStyle}
      data-testid="files-top-bar-actions"
    >
      <Button
        variant="ghost"
        size="icon"
        disabled
        aria-label={t("files.actions.upload")}
        data-testid="files-top-bar-upload"
      >
        <MaterialIcon name="upload_file" size="24px" color="currentColor" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        disabled
        aria-label={t("files.actions.newFolder")}
        data-testid="files-top-bar-new-folder"
      >
        <MaterialIcon name="create_new_folder" size="24px" color="currentColor" />
      </Button>
    </div>
  );
};
