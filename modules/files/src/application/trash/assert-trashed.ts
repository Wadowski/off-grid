// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileRecord } from "../../types.js";
import { NotTrashedError } from "../errors/not-trashed-error.js";

export const assertTrashed = (file: FileRecord): void => {
  if (file.deletedAt === null) {
    throw new NotTrashedError();
  }
};
