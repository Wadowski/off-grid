// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useCallback, useState } from "react";
import { readFilesViewPreference } from "./read-files-view-preference.js";
import { writeFilesViewPreference } from "./write-files-view-preference.js";
import type { FilesViewPreference, FilesViewPreferenceState } from "./types.js";

export const useFilesViewPreference = (): FilesViewPreferenceState => {
  const [preference, setPreference] = useState<FilesViewPreference>(readFilesViewPreference);
  const updatePreference = useCallback(
    (change: Partial<FilesViewPreference>) => {
      const next = { ...preference, ...change };
      setPreference(next);
      writeFilesViewPreference(next);
    },
    [preference],
  );
  return { preference, updatePreference };
};
