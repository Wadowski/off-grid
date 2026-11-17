// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ConfigError } from "../config/config-error.js";
import { directoryKindOf } from "./directory-kind.js";
import { probeDirectoryWritable } from "./probe-directory-writable.js";

const FILES_DIRECTORY_VARIABLE = "OFFGRID_FILES_DIRECTORY";

export const assertFilesDirectoryWritable = async (directory: string): Promise<void> => {
  const kind = await directoryKindOf(directory);
  if (kind === "missing") {
    throw new ConfigError(`${FILES_DIRECTORY_VARIABLE} must name an existing directory`);
  }
  if (kind === "other") {
    throw new ConfigError(`${FILES_DIRECTORY_VARIABLE} must name a directory, not a file`);
  }
  if (!(await probeDirectoryWritable(directory))) {
    throw new ConfigError(
      `${FILES_DIRECTORY_VARIABLE} must name a directory the server can write to`,
    );
  }
};
