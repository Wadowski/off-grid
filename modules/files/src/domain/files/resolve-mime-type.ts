// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { DEFAULT_MIME_TYPE, MIME_TYPE_BY_EXTENSION } from "../../constants.js";

export const resolveMimeType = (declaredMimeType: string | null, fileName: string): string => {
  if (declaredMimeType !== null) {
    return declaredMimeType;
  }
  const extensionStart = fileName.lastIndexOf(".");
  if (extensionStart <= 0) {
    return DEFAULT_MIME_TYPE;
  }
  const extension = fileName.slice(extensionStart + 1).toLowerCase();
  return MIME_TYPE_BY_EXTENSION.get(extension) ?? DEFAULT_MIME_TYPE;
};
