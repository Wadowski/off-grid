// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { UploadItem, UploadTarget } from "../types.js";

export const createUploadItem = (
  id: string,
  file: File,
  target: UploadTarget,
  familyId: string | null,
): UploadItem => ({
  id,
  familyId,
  name: file.name,
  mimeType: file.type,
  sizeBytes: file.size,
  driveId: target.driveId,
  folderId: target.folderId,
  status: "queued",
  percent: 0,
  errorTextId: null,
  file,
});
