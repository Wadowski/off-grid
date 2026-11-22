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
export const IS_FOLDER_CONTENT_MESSAGE = "A folder has no content to download.";
export const RANGE_NOT_SATISFIABLE_MESSAGE = "The requested byte range is outside the file.";
export const INLINE_SAFE_MEDIA_TYPES: ReadonlySet<string> = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "application/pdf",
]);
export const PDF_MEDIA_TYPE = "application/pdf";
export const INLINE_IMAGE_CONTENT_SECURITY_POLICY = "default-src 'none'; sandbox";
export const INLINE_PDF_CONTENT_SECURITY_POLICY =
  "default-src 'none'; object-src 'self'; frame-ancestors 'self'";
export const FALLBACK_DOWNLOAD_FILE_NAME = "download";
export const SINGLE_BYTE_RANGE_PATTERN = /^bytes=(\d*)-(\d*)$/i;
export const CACHE_CONTROL_NO_STORE_VALUE = "private, no-store";
export const LONE_SURROGATE_PATTERN =
  /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g;
