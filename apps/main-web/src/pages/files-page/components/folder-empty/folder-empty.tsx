// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { IconTile, MaterialIcon, Text } from "@offgrid/ui";
import { folderEmptyIconColors, folderEmptyStyle } from "./styles.js";

export const FolderEmpty = () => (
  <div role="status" style={folderEmptyStyle} data-testid="files-empty">
    <IconTile size="3rem" {...folderEmptyIconColors}>
      <MaterialIcon name="folder_open" size="24px" color="currentColor" />
    </IconTile>
    <Text variant="subheading" textId="files.folder.emptyHeading" />
    <Text variant="caption" textId="files.folder.emptyHint" />
  </div>
);
