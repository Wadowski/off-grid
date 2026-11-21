// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CurrentFolderState, Drive, FileDetailsState } from "./types.js";

export const toFolderState = (
  details: FileDetailsState,
  driveId: Drive["id"],
): CurrentFolderState => {
  if (details.status === "loading") {
    return { status: "loading", driveId, breadcrumbs: [], errorTextId: null };
  }
  if (details.status === "failed") {
    if (details.errorTextId === "files.errors.notFound") {
      return { status: "not-found", driveId, breadcrumbs: [], errorTextId: null };
    }
    return { status: "failed", driveId, breadcrumbs: [], errorTextId: details.errorTextId };
  }
  if (details.file === null || !details.file.isFolder || details.file.driveId !== driveId) {
    return { status: "not-found", driveId, breadcrumbs: [], errorTextId: null };
  }
  return { status: "ready", driveId, breadcrumbs: details.breadcrumbs, errorTextId: null };
};
