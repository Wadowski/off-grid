// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileDetails } from "../../types.js";
import { toFile } from "./to-file.js";

export const toFileDetails = (details: FileDetails) => ({
  file: toFile(details.file),
  breadcrumbs: details.breadcrumbs,
});
