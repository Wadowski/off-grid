// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { FILES_VIEW_PREFERENCE_KEY } from "./constants.js";
import type { FilesViewPreference } from "./types.js";

export const writeFilesViewPreference = (preference: FilesViewPreference): void => {
  try {
    window.localStorage.setItem(FILES_VIEW_PREFERENCE_KEY, JSON.stringify(preference));
  } catch {
    return;
  }
};
