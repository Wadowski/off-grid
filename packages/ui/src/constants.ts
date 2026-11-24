// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileKind } from "./files/types.js";
import type { FileTableColumn } from "./file-table/types.js";
import type { FileTypeIconSize } from "./file-type-icon/types.js";
import type { TextVariant } from "./text/types.js";

export const TEXT_VARIANT_ELEMENTS: Record<TextVariant, "h1" | "h2" | "p" | "span"> = {
  brand: "p",
  heading: "h1",
  subheading: "h2",
  body: "p",
  label: "span",
  action: "span",
  status: "p",
  link: "span",
  error: "p",
  caption: "span",
};

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

export const FILE_KIND_GLYPHS: Readonly<Record<FileKind, string>> = {
  folder: "folder",
  image: "image",
  document: "description",
  spreadsheet: "table_chart",
  pdf: "picture_as_pdf",
  archive: "folder_zip",
  audio: "audio_file",
  video: "video_file",
  generic: "draft",
};

export const FILE_TYPE_ICON_SIZES: Readonly<
  Record<FileTypeIconSize, { readonly tile: string; readonly glyph: string }>
> = {
  sm: { tile: "1.5rem", glyph: "1rem" },
  md: { tile: "2.5rem", glyph: "1.5rem" },
  lg: { tile: "3.5rem", glyph: "2rem" },
};

export const FILE_TABLE_COLUMNS: readonly FileTableColumn[] = [
  { key: "name", textId: "files.table.name", align: "start", width: "auto" },
  { key: "modified", textId: "files.table.modified", align: "start", width: "1%" },
  { key: "size", textId: "files.table.size", align: "end", width: "7rem" },
  { key: "type", textId: "files.table.type", align: "start", width: "9rem" },
];

export const FILE_TABLE_ACTIONS_WIDTH = "3rem";

export const FLOATING_PANEL_Z_INDEX = 20;

export const PROGRESS_BAR_HEIGHT = "0.375rem";
