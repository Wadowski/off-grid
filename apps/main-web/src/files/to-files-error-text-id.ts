// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import { filesErrorCodeSchema } from "@offgrid/contracts";
import { FILES_ERROR_TEXT_IDS } from "./constants.js";
import type { FilesErrorTextId } from "./types.js";

export const toFilesErrorTextId = (error: unknown): FilesErrorTextId => {
  if (error instanceof ApiError) {
    const parsedCode = filesErrorCodeSchema.safeParse(error.code);
    if (parsedCode.success) {
      return FILES_ERROR_TEXT_IDS[parsedCode.data];
    }
    if (error.status === 404) {
      return "files.errors.notFound";
    }
  }
  return "files.errors.failed";
};
