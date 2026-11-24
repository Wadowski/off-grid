// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { toFileVersionRows } from "../../../../files/to-file-version-rows.js";
import { useFileVersionActions } from "../../../../files/use-file-version-actions.js";
import { useUploadNewVersion } from "../../../../files/use-upload-new-version.js";
import { FileVersionsSection } from "../file-versions-section/file-versions-section.js";
import type { FileDetailsVersionsProps } from "./types.js";

export const FileDetailsVersions = ({
  file,
  versions,
  resolveName,
  refreshAll,
}: FileDetailsVersionsProps) => {
  const actions = useFileVersionActions(file.id, refreshAll);
  const uploadNewVersion = useUploadNewVersion(
    { driveId: file.driveId, folderId: file.parentId, fileId: file.id },
    refreshAll,
  );

  return (
    <FileVersionsSection
      variant="screen"
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
