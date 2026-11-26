// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { isDirectoryItem } from "./is-directory-item.js";

export const toDroppedFiles = (dataTransfer: DataTransfer): File[] =>
  Array.from(dataTransfer.items).flatMap((item) => {
    if (item.kind !== "file" || isDirectoryItem(item)) {
      return [];
    }
    const file = item.getAsFile();
    return file === null ? [] : [file];
  });
