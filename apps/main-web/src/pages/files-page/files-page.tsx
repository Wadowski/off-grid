// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { FolderNotFound } from "../../errors/folder-not-found/folder-not-found.js";
import { useCurrentFolder } from "../../files/use-current-folder.js";
import { Breadcrumbs } from "./components/breadcrumbs/breadcrumbs.js";
import { filesPageStyle } from "./styles.js";

export const FilesPage = () => {
  const folder = useCurrentFolder();

  if (folder.status === "not-found") {
    return <FolderNotFound />;
  }

  return (
    <div style={filesPageStyle} data-testid="files-page">
      <Text variant="heading" textId="files.layout.heading" />
      {folder.driveId === null ? null : (
        <Breadcrumbs
          driveId={folder.driveId}
          breadcrumbs={folder.breadcrumbs}
          isBusy={folder.status === "loading"}
        />
      )}
      {folder.status === "loading" ? <Text variant="body" textId="files.folder.loading" /> : null}
      {folder.status === "failed" ? (
        <Text variant="error" role="alert" textId={folder.errorTextId ?? "files.errors.failed"} />
      ) : null}
      {folder.status === "ready" ? <Text variant="body" textId="files.layout.placeholder" /> : null}
    </div>
  );
};
