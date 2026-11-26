// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileEntry } from "../../files/types.js";
import type { UploadItem, UploadTarget } from "../types.js";
import { createUploadItem } from "./create-upload-item.js";
import { isOverUploadLimit } from "./is-over-upload-limit.js";

export const createCheckedUploadItem = (
  id: string,
  file: File,
  target: UploadTarget,
  familyId: string | null,
  fileId: FileEntry["id"] | null,
  maxUploadBytes: number | null,
): UploadItem => {
  const item = createUploadItem(id, file, target, familyId, fileId);
  if (!isOverUploadLimit(file.size, maxUploadBytes)) {
    return item;
  }
  return { ...item, status: "failed", errorTextId: "files.errors.payloadTooLarge", file: null };
};
