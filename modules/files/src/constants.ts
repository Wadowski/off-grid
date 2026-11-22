// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const STORAGE_SWEEP_GRACE_MS = 60 * 60 * 1000;
export const STORAGE_SWEEP_BATCH_SIZE = 1000;
export const STORAGE_SWEEP_INTERVAL_MS = 24 * 60 * 60 * 1000;
export const STORAGE_SWEEP_FIRST_RUN_DELAY_MS = 60 * 1000;
export const PERSONAL_DRIVE_NAME = "Personal";
export const MAX_ANCESTOR_DEPTH = 256;
export const NAME_TAKEN_MESSAGE = "A file or folder with this name already exists here.";
export const INVALID_MOVE_MESSAGE = "This entry cannot be moved there.";
export const UNIQUE_VIOLATION_CODE = "P2002";
export const FILES_FILE_MODEL = "FilesFile";
export const MAX_MOVE_ENTRY_COUNT = 10000;
export const PAYLOAD_TOO_LARGE_MESSAGE =
  "The file is larger than the upload limit. Nothing was stored.";
export const DEFAULT_MIME_TYPE = "application/octet-stream";
export const MEDIA_TYPE_PATTERN = /^[a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+$/;
export const MAX_MEDIA_TYPE_LENGTH = 255;
export const DIGITS_PATTERN = /^\d+$/;
export const MIME_TYPE_BY_EXTENSION: ReadonlyMap<string, string> = new Map([
  ["txt", "text/plain"],
  ["md", "text/markdown"],
  ["csv", "text/csv"],
  ["json", "application/json"],
  ["pdf", "application/pdf"],
  ["png", "image/png"],
  ["jpg", "image/jpeg"],
  ["jpeg", "image/jpeg"],
  ["gif", "image/gif"],
  ["webp", "image/webp"],
  ["mp3", "audio/mpeg"],
  ["mp4", "video/mp4"],
  ["zip", "application/zip"],
]);
export const CURRENT_VERSION_MESSAGE = "The current version of a file cannot be deleted.";
export const IS_FOLDER_MESSAGE = "A folder has no versions.";
