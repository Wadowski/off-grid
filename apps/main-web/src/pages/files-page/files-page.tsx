// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { useOutletContext } from "react-router-dom";
import { PHONE_CHROME_MEDIA_QUERY } from "../../constants.js";
import { ItemNotFound } from "../../errors/item-not-found/item-not-found.js";
import { useCurrentFolder } from "../../files/use-current-folder.js";
import { useRefreshOnFilesChanged } from "../../files/use-refresh-on-files-changed.js";
import { DEFAULT_FILES_SORT_ORDER } from "../../files/constants.js";
import { useFilesViewPreference } from "../../files/use-files-view-preference.js";
import { useNewFolderDialog } from "../../files/use-new-folder-dialog.js";
import { useRefreshOnUploadDone } from "../../files/use-refresh-on-upload-done.js";
import { useFolderContents } from "../../files/use-folder-contents.js";
import { toParentFolderPath } from "../../files/to-parent-folder-path.js";
import { useMediaQuery } from "../../media/use-media-query.js";
import { useUploadQueueContext } from "../../uploads/index.js";
import type { FilesOutletContext } from "../../layouts/files-layout/types.js";
import { NewFolderDialog } from "../../files/components/new-folder-dialog/new-folder-dialog.js";
import { BackLink } from "./components/back-link/back-link.js";
import { Breadcrumbs } from "./components/breadcrumbs/breadcrumbs.js";
import { FilesHeader } from "./components/files-header/files-header.js";
import { FilesTopBar } from "./components/files-top-bar/files-top-bar.js";
import { FolderContents } from "./components/folder-contents/folder-contents.js";
import { ViewControls } from "./components/view-controls/view-controls.js";
import { filesPageStyle } from "./styles.js";
import { toTrashClearsSelection } from "./to-trash-clears-selection.js";

export const FilesPage = () => {
  const folder = useCurrentFolder();
  const phone = useMediaQuery(PHONE_CHROME_MEDIA_QUERY);
  const switcher = useOutletContext<FilesOutletContext>();
  const { preference, updatePreference } = useFilesViewPreference();
  const sortOrder = phone
    ? DEFAULT_FILES_SORT_ORDER
    : { sort: preference.sort, direction: preference.direction };
  const contents = useFolderContents(
    folder.driveId,
    folder.folderId,
    folder.status === "ready" && folder.driveId !== null,
    sortOrder,
  );

  const queue = useUploadQueueContext();
  const uploadDisabled = folder.status !== "ready" || folder.driveId === null;
  const enqueueFiles = (files: readonly File[]) => {
    if (folder.driveId !== null) {
      queue.enqueue(files, { driveId: folder.driveId, folderId: folder.folderId });
    }
  };
  useRefreshOnUploadDone(folder.driveId, folder.folderId, contents.refreshQuietly);
  useRefreshOnFilesChanged(switcher.filesChangedCount, contents.refreshQuietly);
  const newFolder = useNewFolderDialog();
  const newFolderDisabled = uploadDisabled;

  if (folder.status === "not-found") {
    return <ItemNotFound kind="folder" />;
  }

  const parentPath =
    folder.driveId === null ? null : toParentFolderPath(folder.driveId, folder.breadcrumbs);
  const parentName = folder.breadcrumbs.at(-2)?.name;
  const driveName = folder.breadcrumbs.at(0)?.name;

  return (
    <div style={filesPageStyle} data-testid="files-page">
      {phone ? (
        <FilesTopBar
          drives={switcher.drives}
          status={switcher.status}
          activeDriveId={switcher.activeDriveId}
          uploadDisabled={uploadDisabled}
          onFilesPicked={enqueueFiles}
          newFolderDisabled={newFolderDisabled}
          onNewFolder={newFolder.open}
        />
      ) : (
        <FilesHeader
          driveName={driveName}
          uploadDisabled={uploadDisabled}
          onFilesPicked={enqueueFiles}
          newFolderDisabled={newFolderDisabled}
          onNewFolder={newFolder.open}
          viewControls={
            folder.driveId === null ? null : (
              <ViewControls
                view={preference.view}
                sort={preference.sort}
                direction={preference.direction}
                onChange={updatePreference}
              />
            )
          }
        />
      )}
      {folder.driveId === null ? null : (
        <>
          {phone && parentPath !== null && parentName !== undefined ? (
            <BackLink to={parentPath} parentName={parentName} />
          ) : null}
          <Breadcrumbs
            driveId={folder.driveId}
            breadcrumbs={folder.breadcrumbs}
            isBusy={folder.status === "loading"}
            phone={phone}
          />
        </>
      )}
      {newFolder.isOpen && folder.driveId !== null ? (
        <NewFolderDialog
          driveId={folder.driveId}
          parentId={folder.folderId}
          onCreated={() => void contents.refreshQuietly()}
          onClose={newFolder.close}
        />
      ) : null}
      {folder.status === "loading" ? <Text variant="body" textId="files.folder.loading" /> : null}
      {folder.status === "failed" ? (
        <Text variant="error" role="alert" textId={folder.errorTextId ?? "files.errors.failed"} />
      ) : null}
      {folder.status === "ready" && folder.driveId !== null ? (
        <FolderContents
          key={`${folder.driveId}:${folder.folderId ?? ""}`}
          driveId={folder.driveId}
          contents={contents}
          phone={phone}
          view={phone ? "list" : preference.view}
          selectedId={switcher.selectedFileId}
          onSelect={switcher.onSelectFile}
          onEntryTrashed={(fileId) => {
            if (toTrashClearsSelection(fileId, switcher.selectedFileId, folder.breadcrumbs)) {
              switcher.onClearSelection();
            }
          }}
          onEntryRenamed={switcher.onFilesChanged}
        />
      ) : null}
    </div>
  );
};
