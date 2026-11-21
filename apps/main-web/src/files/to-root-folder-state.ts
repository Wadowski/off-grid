// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CurrentFolderState, Drive, DrivesState } from "./types.js";

export const toRootFolderState = (
  drives: DrivesState,
  driveId: Drive["id"],
): CurrentFolderState => {
  if (drives.status !== "ready") {
    return { status: drives.status, driveId, breadcrumbs: [], errorTextId: drives.errorTextId };
  }
  const drive = drives.drives.find((listed) => listed.id === driveId);
  if (drive === undefined) {
    return { status: "not-found", driveId, breadcrumbs: [], errorTextId: null };
  }
  return {
    status: "ready",
    driveId,
    breadcrumbs: [{ kind: "drive", id: drive.id, name: drive.name }],
    errorTextId: null,
  };
};
