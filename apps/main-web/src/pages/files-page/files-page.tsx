// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { useOutletContext } from "react-router-dom";
import { PHONE_CHROME_MEDIA_QUERY } from "../../constants.js";
import { FolderNotFound } from "../../errors/folder-not-found/folder-not-found.js";
import { useCurrentFolder } from "../../files/use-current-folder.js";
import { DEFAULT_FILES_SORT_ORDER } from "../../files/constants.js";
import { useFilesViewPreference } from "../../files/use-files-view-preference.js";
import { useFolderContents } from "../../files/use-folder-contents.js";
import { toParentFolderPath } from "../../files/to-parent-folder-path.js";
import { useMediaQuery } from "../../media/use-media-query.js";
import type { DriveSwitcherProps } from "../../layouts/files-layout/components/drive-switcher/types.js";
import { BackLink } from "./components/back-link/back-link.js";
import { Breadcrumbs } from "./components/breadcrumbs/breadcrumbs.js";
import { FilesTopBar } from "./components/files-top-bar/files-top-bar.js";
import { FolderContents } from "./components/folder-contents/folder-contents.js";
import { ViewControls } from "./components/view-controls/view-controls.js";
import { filesHeadingRowStyle, filesPageStyle } from "./styles.js";

export const FilesPage = () => {
  const folder = useCurrentFolder();
  const phone = useMediaQuery(PHONE_CHROME_MEDIA_QUERY);
  const switcher = useOutletContext<DriveSwitcherProps>();
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

  if (folder.status === "not-found") {
    return <FolderNotFound />;
  }

  const parentPath =
    folder.driveId === null ? null : toParentFolderPath(folder.driveId, folder.breadcrumbs);
  const parentName = folder.breadcrumbs.at(-2)?.name;
  const driveName = folder.breadcrumbs.at(0)?.name;
  const showsDriveName = !phone && driveName !== undefined;

  return (
    <div style={filesPageStyle} data-testid="files-page">
      {phone ? (
        <FilesTopBar
          drives={switcher.drives}
          status={switcher.status}
          activeDriveId={switcher.activeDriveId}
        />
      ) : (
        <div style={filesHeadingRowStyle} data-testid="files-heading-row">
          {showsDriveName ? (
            <Text variant="heading" value={driveName} />
          ) : (
            <Text variant="heading" textId="files.layout.heading" />
          )}
          {folder.driveId === null ? null : (
            <ViewControls
              view={preference.view}
              sort={preference.sort}
              direction={preference.direction}
              onChange={updatePreference}
            />
          )}
        </div>
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
        />
      ) : null}
    </div>
  );
};
