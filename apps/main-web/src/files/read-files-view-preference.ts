// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FilesViewPreference } from "./types.js";
import { DEFAULT_FILES_VIEW_PREFERENCE, FILES_VIEW_PREFERENCE_KEY } from "./constants.js";
import { filesViewPreferenceSchema } from "./files-view-preference-schema.js";

export const readFilesViewPreference = (): FilesViewPreference => {
  try {
    const raw = window.localStorage.getItem(FILES_VIEW_PREFERENCE_KEY);
    if (raw === null) {
      return DEFAULT_FILES_VIEW_PREFERENCE;
    }
    const parsed = filesViewPreferenceSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : DEFAULT_FILES_VIEW_PREFERENCE;
  } catch {
    return DEFAULT_FILES_VIEW_PREFERENCE;
  }
};
