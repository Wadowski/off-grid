// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FilesErrorCode, FilesErrorTextId, FolderContentsSnapshot } from "./types.js";

export const FILE_LOCATION_SEPARATOR = " › ";

export const FILES_ERROR_TEXT_IDS: Record<FilesErrorCode, FilesErrorTextId> = {
  NOT_FOUND: "files.errors.notFound",
  VALIDATION_FAILED: "files.errors.validationFailed",
  UNAUTHENTICATED: "files.errors.unauthenticated",
  NAME_TAKEN: "files.errors.nameTaken",
  INVALID_MOVE: "files.errors.invalidMove",
  NOT_TRASHED: "files.errors.notTrashed",
  IS_FOLDER: "files.errors.isFolder",
  UPLOAD_INCOMPLETE: "files.errors.uploadIncomplete",
  UPLOAD_OFFSET_MISMATCH: "files.errors.uploadOffsetMismatch",
  PAYLOAD_TOO_LARGE: "files.errors.payloadTooLarge",
  CURRENT_VERSION: "files.errors.currentVersion",
  RANGE_NOT_SATISFIABLE: "files.errors.failed",
};

export const EMPTY_FOLDER_CONTENTS: FolderContentsSnapshot = {
  items: [],
  nextCursor: null,
  status: "loading",
  errorTextId: null,
  isLoadingMore: false,
};
