// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileNameParts } from "../../types.js";

export const splitFileName = (name: string, isFolder: boolean): FileNameParts => {
  const dotIndex = name.lastIndexOf(".");
  if (isFolder || dotIndex <= 0) {
    return { stem: name, extension: "" };
  }
  return { stem: name.slice(0, dotIndex), extension: name.slice(dotIndex) };
};
