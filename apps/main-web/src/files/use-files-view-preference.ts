// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useCallback, useState } from "react";
import { readFilesViewPreference } from "./read-files-view-preference.js";
import { writeFilesViewPreference } from "./write-files-view-preference.js";
import type { FilesViewPreference } from "./types.js";

export type FilesViewPreferenceState = {
  readonly preference: FilesViewPreference;
  readonly updatePreference: (change: Partial<FilesViewPreference>) => void;
};

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
