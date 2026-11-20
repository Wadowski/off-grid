// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type UpdateVersionsRowProps = {
  readonly isFirst: boolean;
  readonly currentVersion: string;
  readonly latestVersion: string | null;
  readonly checkedAt: string | null;
};
