// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { toFileVersionRows } from "../../../../../../files/to-file-version-rows.js";
import { useFileVersionActions } from "../../../../../../files/use-file-version-actions.js";
import { useFileVersionAuthors } from "../../../../../../files/use-file-version-authors.js";
import { useFileVersions } from "../../../../../../files/use-file-versions.js";
import { useUploadNewVersion } from "../../../../../../files/use-upload-new-version.js";
import { FileVersionsSection } from "../../../../../file-details-page/components/file-versions-section/file-versions-section.js";
import type { FileDetailsPanelVersionsProps } from "./types.js";

export const FileDetailsPanelVersions = ({
  file,
  onFileChanged,
  onDetailsChanged,
}: FileDetailsPanelVersionsProps) => {
  const versions = useFileVersions(file.id, true);
  const resolveName = useFileVersionAuthors(file.driveId);
  const refreshAfterChange = () => {
    void versions.refreshQuietly();
    void onDetailsChanged();
  };
  const actions = useFileVersionActions(file.id, () => {
    refreshAfterChange();
    onFileChanged();
  });
  const uploadNewVersion = useUploadNewVersion(
    { driveId: file.driveId, folderId: file.parentId, fileId: file.id },
    refreshAfterChange,
  );

  return (
    <FileVersionsSection
      fileName={file.name}
      rows={toFileVersionRows(versions.versions, resolveName)}
      status={versions.status}
      pendingVersionId={actions.pendingVersionId}
      errorTextId={actions.errorTextId}
      completed={actions.completed}
      onUploadPicked={uploadNewVersion}
      onRetry={versions.refresh}
      onRestore={actions.restore}
      onDownload={(row) => void actions.download(row, file.name)}
      onDelete={actions.remove}
    />
  );
};
