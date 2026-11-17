// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { FOLDER_MIME_TYPE, MIME_FAMILY_KINDS, MIME_TYPE_KINDS } from "./constants.js";
import type { FileKind } from "./types.js";

const baseMimeType = (mimeType: string): string =>
  mimeType.split(";")[0]?.trim().toLowerCase() ?? "";

const kindOfMimeFamily = (baseType: string): FileKind | undefined => {
  const family = Object.keys(MIME_FAMILY_KINDS).find((prefix) => baseType.startsWith(prefix));
  return family === undefined ? undefined : MIME_FAMILY_KINDS[family];
};

export const fileKindFromMimeType = (mimeType: string, isFolder: boolean): FileKind => {
  const baseType = baseMimeType(mimeType);
  if (isFolder || baseType === FOLDER_MIME_TYPE) {
    return "folder";
  }
  return MIME_TYPE_KINDS[baseType] ?? kindOfMimeFamily(baseType) ?? "generic";
};
