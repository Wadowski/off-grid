// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type SystemUpdateWorld = {
  previousVersion: string;
  targetVersion: string;
  backupsBroken: boolean;
  nightlyTouched: boolean;
};
