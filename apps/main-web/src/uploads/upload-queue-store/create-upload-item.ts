// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileEntry } from "../../files/types.js";
import type { UploadItem, UploadTarget } from "../types.js";

export const createUploadItem = (
  id: string,
  file: File,
  target: UploadTarget,
  familyId: string | null,
  fileId: FileEntry["id"] | null,
): UploadItem => ({
  id,
  familyId,
  name: file.name,
  mimeType: file.type,
  sizeBytes: file.size,
  driveId: target.driveId,
  folderId: target.folderId,
  fileId,
  status: "queued",
  percent: 0,
  errorTextId: null,
  file,
});
