// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { UploadErrorTextId, UploadItem } from "../types.js";

const UNFIXABLE_ERROR_TEXT_IDS: readonly UploadErrorTextId[] = [
  "files.errors.payloadTooLarge",
  "files.errors.nameTaken",
  "files.errors.notFound",
  "files.errors.validationFailed",
  "files.errors.unauthenticated",
  "files.upload.stoppedFamilySwitch",
];

export const isRetryableUploadItem = (item: UploadItem, activeFamilyId: string | null): boolean =>
  item.status === "failed" &&
  item.file !== null &&
  item.familyId === activeFamilyId &&
  item.errorTextId !== null &&
  !UNFIXABLE_ERROR_TEXT_IDS.includes(item.errorTextId);
