// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export class BackupFailedError extends Error {
  constructor(readonly step: string) {
    super(`backup failed at step ${step}`);
    this.name = "BackupFailedError";
  }
}
