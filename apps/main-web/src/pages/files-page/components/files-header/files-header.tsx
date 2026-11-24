// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { FilePickerButton, MaterialIcon, Text, cssVar } from "@offgrid/ui";
import { filesHeaderActionsStyle, filesHeaderStyle } from "./styles.js";
import type { FilesHeaderProps } from "./types.js";

export const FilesHeader = ({
  driveName,
  uploadDisabled,
  onFilesPicked,
  viewControls,
}: FilesHeaderProps) => (
  <div style={filesHeaderStyle} data-testid="files-header">
    {driveName === undefined ? (
      <Text variant="heading" textId="files.layout.heading" />
    ) : (
      <Text variant="heading" value={driveName} />
    )}
    <div style={filesHeaderActionsStyle}>
      <FilePickerButton
        variant="primary"
        size="medium"
        disabled={uploadDisabled}
        onFilesPicked={onFilesPicked}
        testId="files-upload-button"
        inputTestId="files-upload-input"
      >
        <MaterialIcon name="cloud_upload" size="1.125rem" color={cssVar("color-accent-fg")} />
        <Text variant="action" textId="files.actions.upload" element="span" />
      </FilePickerButton>
      {viewControls}
    </div>
  </div>
);
