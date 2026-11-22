// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, MaterialIcon, Text } from "@offgrid/ui";
import { Link } from "react-router-dom";
import { PHONE_CHROME_MEDIA_QUERY } from "../../constants.js";
import { FolderNotFound } from "../../errors/folder-not-found/folder-not-found.js";
import { useCurrentFolder } from "../../files/use-current-folder.js";
import { useFolderContents } from "../../files/use-folder-contents.js";
import { toParentFolderPath } from "../../files/to-parent-folder-path.js";
import { useMediaQuery } from "../../media/use-media-query.js";
import { BackLink } from "./components/back-link/back-link.js";
import { backLinkStyle } from "./components/back-link/styles.js";
import { Breadcrumbs } from "./components/breadcrumbs/breadcrumbs.js";
import { FolderContents } from "./components/folder-contents/folder-contents.js";
import { filesPageStyle } from "./styles.js";

export const FilesPage = () => {
  const folder = useCurrentFolder();
  const phone = useMediaQuery(PHONE_CHROME_MEDIA_QUERY);
  const contents = useFolderContents(
    folder.driveId,
    folder.folderId,
    folder.status === "ready" && folder.driveId !== null,
  );

  if (folder.status === "not-found") {
    return <FolderNotFound />;
  }

  const parentPath =
    folder.driveId === null ? null : toParentFolderPath(folder.driveId, folder.breadcrumbs);
  const parentName = folder.breadcrumbs.at(-2)?.name;

  return (
    <div style={filesPageStyle} data-testid="files-page">
      <Text variant="heading" textId="files.layout.heading" />
      {phone ? (
        <Link to="/files/drives" style={backLinkStyle} data-testid="files-drives-link">
          <MaterialIcon name="database" size="20px" color={cssVar("color-primary")} />
          <Text variant="label" element="span" textId="files.drives.page" />
        </Link>
      ) : null}
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
        <FolderContents driveId={folder.driveId} contents={contents} />
      ) : null}
    </div>
  );
};
