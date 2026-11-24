// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fileKindFromMimeType } from "@offgrid/ui";
import type { FileDetailsValues, RegularFileEntry } from "./types.js";

export const toFileDetailsValues = (file: RegularFileEntry): FileDetailsValues => ({
  name: file.name,
  kind: fileKindFromMimeType(file.mimeType, false),
  sizeBytes: file.size,
  version: file.version,
  createdAt: new Date(file.createdAt),
  updatedAt: new Date(file.updatedAt),
});
