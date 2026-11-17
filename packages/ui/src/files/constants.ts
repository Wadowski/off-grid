// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileKind } from "./types.js";

export const FILE_SIZE_UNITS = ["B", "KB", "MB", "GB"] as const;

export const FILE_SIZE_BASE = 1000;

export const MILLISECONDS_PER_DAY = 86_400_000;

export const FOLDER_MIME_TYPE = "inode/directory";

export const MIME_FAMILY_KINDS: Readonly<Record<string, FileKind>> = {
  "image/": "image",
  "audio/": "audio",
  "video/": "video",
};

export const MIME_TYPE_KINDS: Readonly<Record<string, FileKind>> = {
  "application/pdf": "pdf",
  "text/csv": "spreadsheet",
  "application/vnd.ms-excel": "spreadsheet",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "spreadsheet",
  "application/vnd.oasis.opendocument.spreadsheet": "spreadsheet",
  "text/plain": "document",
  "text/markdown": "document",
  "application/msword": "document",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "document",
  "application/vnd.oasis.opendocument.text": "document",
  "application/rtf": "document",
  "application/zip": "archive",
  "application/gzip": "archive",
  "application/x-tar": "archive",
  "application/x-7z-compressed": "archive",
  "application/vnd.rar": "archive",
  "application/x-rar-compressed": "archive",
  "application/x-bzip2": "archive",
};
