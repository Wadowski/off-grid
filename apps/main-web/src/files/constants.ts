// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type {
  FilesErrorCode,
  FilesErrorTextId,
  FilesSortField,
  FilesSortOrder,
  FilesViewPreference,
  DriveTrashSnapshot,
  FolderContentsSnapshot,
  PreviewKind,
} from "./types.js";

export const FILES_VIEW_PREFERENCE_KEY = "offgrid.files.viewPreference";

export const NO_DRIVE_HINT_ID = "files-no-drive-hint";

export const FILES_SORT_FIELDS: readonly FilesSortField[] = ["name", "modified", "size"];

export const DEFAULT_FILES_SORT_ORDER: FilesSortOrder = { sort: "name", direction: "asc" };

export const DEFAULT_FILES_VIEW_PREFERENCE: FilesViewPreference = {
  view: "list",
  ...DEFAULT_FILES_SORT_ORDER,
};

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

export const EMPTY_DRIVE_TRASH: DriveTrashSnapshot = {
  items: [],
  status: "loading",
  errorTextId: null,
};

export const TRASH_PAGE_LIMIT = 200;

export const PREVIEW_KIND_BY_MEDIA_TYPE: Readonly<Record<string, PreviewKind>> = {
  "image/png": "image",
  "image/jpeg": "image",
  "image/gif": "image",
  "image/webp": "image",
  "application/pdf": "pdf",
};
