// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, FilePickerButton, MaterialIcon, Text, cssVar } from "@offgrid/ui";
import { NO_DRIVE_HINT_ID } from "../../../../files/constants.js";
import { NoDriveHint } from "../no-drive-hint/no-drive-hint.js";
import { filesHeaderActionsStyle, filesHeaderStyle } from "./styles.js";
import type { FilesHeaderProps } from "./types.js";

export const FilesHeader = ({
  driveName,
  uploadDisabled,
  onFilesPicked,
  newFolderDisabled,
  onNewFolder,
  noDrive = false,
  viewControls,
}: FilesHeaderProps) => {
  const hintId = noDrive ? NO_DRIVE_HINT_ID : undefined;

  return (
    <div style={filesHeaderStyle} data-testid="files-header">
      {driveName === undefined ? (
        <Text variant="heading" textId="files.layout.heading" />
      ) : (
        <Text variant="heading" value={driveName} />
      )}
      <div style={filesHeaderActionsStyle}>
        <Button
          variant="secondary"
          size="medium"
          disabled={newFolderDisabled}
          onClick={onNewFolder}
          aria-describedby={hintId}
          data-testid="files-new-folder-button"
        >
          <MaterialIcon name="create_new_folder" size="1.125rem" color={cssVar("color-fg")} />
          <Text variant="action" textId="files.actions.newFolder" element="span" />
        </Button>
        <FilePickerButton
          variant="primary"
          size="medium"
          disabled={uploadDisabled}
          ariaDescribedBy={hintId}
          onFilesPicked={onFilesPicked}
          testId="files-upload-button"
          inputTestId="files-upload-input"
        >
          <MaterialIcon name="cloud_upload" size="1.125rem" color={cssVar("color-accent-fg")} />
          <Text variant="action" textId="files.actions.upload" element="span" />
        </FilePickerButton>
        {viewControls}
      </div>
      {noDrive ? <NoDriveHint /> : null}
    </div>
  );
};
