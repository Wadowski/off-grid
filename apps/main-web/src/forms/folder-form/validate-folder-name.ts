// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { FILE_NAME_MAX_LENGTH, fileNameSchema } from "@offgrid/contracts";
import type { FolderNameError } from "./types.js";

export const validateFolderName = (name: string): FolderNameError | undefined => {
  const trimmedName = name.trim();
  if (trimmedName === "") {
    return "nameRequired";
  }
  if (trimmedName.length > FILE_NAME_MAX_LENGTH) {
    return "nameTooLong";
  }
  return fileNameSchema.safeParse(trimmedName).success ? undefined : "nameInvalid";
};
