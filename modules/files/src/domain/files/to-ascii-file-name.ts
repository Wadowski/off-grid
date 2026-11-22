// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { FALLBACK_DOWNLOAD_FILE_NAME } from "../../constants.js";

export const toAsciiFileName = (fileName: string): string => {
  const replaced = fileName.replace(/[^\x20-\x7e]|["\\]/g, "_");
  return replaced.trim() === "" ? FALLBACK_DOWNLOAD_FILE_NAME : replaced;
};
