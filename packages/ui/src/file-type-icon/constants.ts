// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileKind } from "../files/types.js";
import type { FileTypeIconSize } from "./types.js";

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
