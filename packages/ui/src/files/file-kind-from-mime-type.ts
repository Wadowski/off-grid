// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { FOLDER_MIME_TYPE, MIME_TYPE_KINDS } from "../constants.js";
import { baseMimeType } from "./base-mime-type.js";
import { kindOfMimeFamily } from "./kind-of-mime-family.js";
import type { FileKind } from "./types.js";

export const fileKindFromMimeType = (mimeType: string, isFolder: boolean): FileKind => {
  const baseType = baseMimeType(mimeType);
  if (isFolder || baseType === FOLDER_MIME_TYPE) {
    return "folder";
  }
  return MIME_TYPE_KINDS[baseType] ?? kindOfMimeFamily(baseType) ?? "generic";
};
