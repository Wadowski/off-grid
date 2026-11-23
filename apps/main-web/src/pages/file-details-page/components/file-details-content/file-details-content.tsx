// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Navigate } from "react-router-dom";
import { FileNotFound } from "../../../../errors/file-not-found/file-not-found.js";
import { toFileBackTarget } from "../../../../files/to-file-back-target.js";
import { toFolderPath } from "../../../../files/to-folder-path.js";
import { FileDetailsFrame } from "../file-details-frame/file-details-frame.js";
import { FileDetailsReady } from "../file-details-ready/file-details-ready.js";
import { FileDetailsStatus } from "../file-details-status/file-details-status.js";
import type { FileDetailsContentProps } from "./types.js";

export const FileDetailsContent = ({ driveId, details }: FileDetailsContentProps) => {
  const { file, breadcrumbs, status, errorTextId, refresh } = details;

  if (status === "failed" && errorTextId === "files.errors.notFound") {
    return (
      <FileDetailsFrame backTarget={null}>
        <FileNotFound />
      </FileDetailsFrame>
    );
  }
  if (status === "failed") {
    return (
      <FileDetailsFrame backTarget={null}>
        <FileDetailsStatus status="failed" errorTextId={errorTextId} onRetry={refresh} />
      </FileDetailsFrame>
    );
  }
  if (status === "loading" || file === null) {
    return (
      <FileDetailsFrame backTarget={null}>
        <FileDetailsStatus status="loading" />
      </FileDetailsFrame>
    );
  }
  if (file.driveId !== driveId || file.deletedAt !== null) {
    return (
      <FileDetailsFrame backTarget={null}>
        <FileNotFound />
      </FileDetailsFrame>
    );
  }
  if (file.isFolder) {
    return <Navigate replace to={toFolderPath(driveId, file.id)} />;
  }
  return (
    <FileDetailsFrame backTarget={toFileBackTarget(driveId, breadcrumbs)}>
      <FileDetailsReady
        file={file}
        breadcrumbs={breadcrumbs}
        backTarget={toFileBackTarget(driveId, breadcrumbs)}
      />
    </FileDetailsFrame>
  );
};
