// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { FILE_NAME_MAX_LENGTH, fileNameSchema } from "@offgrid/contracts";
import type { FolderNameErrorTextId } from "./types.js";

export const validateFolderName = (name: string): FolderNameErrorTextId | undefined => {
  const trimmedName = name.trim();
  if (trimmedName === "") {
    return "files.newFolder.errors.nameRequired";
  }
  if (trimmedName.length > FILE_NAME_MAX_LENGTH) {
    return "files.newFolder.errors.nameTooLong";
  }
  return fileNameSchema.safeParse(trimmedName).success
    ? undefined
    : "files.newFolder.errors.nameInvalid";
};
