// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, FilePickerButton, MaterialIcon } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { topBarActionsStyle } from "./styles.js";
import type { TopBarActionsProps } from "./types.js";

export const TopBarActions = ({
  uploadDisabled,
  trashPath,
  onFilesPicked,
  newFolderDisabled,
  onNewFolder,
}: TopBarActionsProps) => {
  const { t } = useTranslation();

  return (
    <div
      role="group"
      aria-label={t("files.topBar.actionsLabel")}
      style={topBarActionsStyle}
      data-testid="files-top-bar-actions"
    >
      <FilePickerButton
        variant="ghost"
        size="icon"
        ariaLabel={t("files.actions.upload")}
        disabled={uploadDisabled}
        onFilesPicked={onFilesPicked}
        testId="files-top-bar-upload"
        inputTestId="files-upload-input"
      >
        <MaterialIcon name="upload_file" size="24px" color="currentColor" />
      </FilePickerButton>
      {trashPath === null ? null : (
        <Button
          as={Link}
          to={trashPath}
          variant="ghost"
          size="icon"
          ariaLabelTextId="files.trash.open"
          data-testid="files-top-bar-trash"
        >
          <MaterialIcon name="delete" size="24px" color="currentColor" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        disabled={newFolderDisabled}
        onClick={onNewFolder}
        aria-label={t("files.actions.newFolder")}
        data-testid="files-top-bar-new-folder"
      >
        <MaterialIcon name="create_new_folder" size="24px" color="currentColor" />
      </Button>
    </div>
  );
};
