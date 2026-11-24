// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { readLocalStorageJson } from "../local-storage/read-local-storage-json.js";
import type { FilesViewPreference } from "./types.js";
import { DEFAULT_FILES_VIEW_PREFERENCE, FILES_VIEW_PREFERENCE_KEY } from "./constants.js";
import { filesViewPreferenceSchema } from "./files-view-preference-schema.js";

export const readFilesViewPreference = (): FilesViewPreference =>
  readLocalStorageJson(FILES_VIEW_PREFERENCE_KEY, filesViewPreferenceSchema) ??
  DEFAULT_FILES_VIEW_PREFERENCE;
