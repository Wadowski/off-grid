// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { BACKUP_NAME_PATTERN } from "../constants.js";
import { formatBackupTimestamp } from "./format-backup-timestamp.js";

export const buildBackupName = (version: string, createdAt: Date): string => {
  const name = `offgrid-${version}-${formatBackupTimestamp(createdAt)}`;
  if (!BACKUP_NAME_PATTERN.test(name)) {
    throw new Error("backup version contains characters that cannot be part of a backup name");
  }
  return name;
};
