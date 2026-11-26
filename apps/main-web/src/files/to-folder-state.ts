// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CurrentFolderState, Drive, FileDetailsState, FileEntry } from "./types.js";

export const toFolderState = (
  details: FileDetailsState,
  driveId: Drive["id"],
  folderId: FileEntry["id"],
): CurrentFolderState => {
  if (details.status === "loading") {
    return {
      status: "loading",
      driveId,
      folderId,
      breadcrumbs: [],
      errorTextId: null,
      refresh: details.refresh,
    };
  }
  if (details.status === "failed") {
    if (details.errorTextId === "files.errors.notFound") {
      return {
        status: "not-found",
        driveId,
        folderId,
        breadcrumbs: [],
        errorTextId: null,
        refresh: details.refresh,
      };
    }
    return {
      status: "failed",
      driveId,
      folderId,
      breadcrumbs: [],
      errorTextId: details.errorTextId,
      refresh: details.refresh,
    };
  }
  if (details.file === null || !details.file.isFolder || details.file.driveId !== driveId) {
    return {
      status: "not-found",
      driveId,
      folderId,
      breadcrumbs: [],
      errorTextId: null,
      refresh: details.refresh,
    };
  }
  const current = { kind: "folder", id: details.file.id, name: details.file.name } as const;
  return {
    status: "ready",
    driveId,
    folderId,
    breadcrumbs: [...details.breadcrumbs, current],
    errorTextId: null,
    refresh: details.refresh,
  };
};
