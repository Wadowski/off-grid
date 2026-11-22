// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { driveIdSchema, fileIdSchema } from "@offgrid/contracts";
import { useParams } from "react-router-dom";
import type { CurrentFolderState } from "./types.js";
import { toFolderState } from "./to-folder-state.js";
import { toRootFolderState } from "./to-root-folder-state.js";
import { useDrives } from "./use-drives.js";
import { useFileDetails } from "./use-file-details.js";

export const useCurrentFolder = (): CurrentFolderState => {
  const { driveId: rawDriveId, folderId: rawFolderId } = useParams();
  const driveId = driveIdSchema.safeParse(rawDriveId).data ?? null;
  const isRoot = rawFolderId === undefined;
  const folderId = isRoot ? null : (fileIdSchema.safeParse(rawFolderId).data ?? null);
  const drives = useDrives(isRoot && driveId !== null);
  const details = useFileDetails(folderId, !isRoot && folderId !== null && driveId !== null);

  if (rawDriveId === undefined) {
    return { status: "ready", driveId: null, folderId: null, breadcrumbs: [], errorTextId: null };
  }
  if (driveId === null) {
    return {
      status: "not-found",
      driveId: null,
      folderId: null,
      breadcrumbs: [],
      errorTextId: null,
    };
  }
  if (isRoot) {
    return toRootFolderState(drives, driveId);
  }
  if (folderId === null) {
    return { status: "not-found", driveId, folderId: null, breadcrumbs: [], errorTextId: null };
  }
  return toFolderState(details, driveId, folderId);
};
