// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { toTrashPath } from "../../../../files/to-trash-path.js";
import { NoDriveHint } from "../no-drive-hint/no-drive-hint.js";
import { DriveControl } from "./components/drive-control/drive-control.js";
import { TopBarActions } from "./components/top-bar-actions/top-bar-actions.js";
import type { FilesTopBarProps } from "./types.js";
import { filesTopBarStyle } from "./styles.js";

export const FilesTopBar = ({
  drives,
  status,
  activeDriveId,
  uploadDisabled,
  onFilesPicked,
  newFolderDisabled,
  onNewFolder,
  noDrive = false,
}: FilesTopBarProps) => {
  const activeDriveName = drives.find((drive) => drive.id === activeDriveId)?.name ?? null;

  return (
    <div style={filesTopBarStyle} data-testid="files-top-bar">
      <DriveControl status={status} activeDriveName={activeDriveName} />
      <TopBarActions
        uploadDisabled={uploadDisabled}
        trashPath={activeDriveId === null ? null : toTrashPath(activeDriveId)}
        onFilesPicked={onFilesPicked}
        newFolderDisabled={newFolderDisabled}
        onNewFolder={onNewFolder}
        noDrive={noDrive}
      />
      {noDrive ? <NoDriveHint /> : null}
    </div>
  );
};
