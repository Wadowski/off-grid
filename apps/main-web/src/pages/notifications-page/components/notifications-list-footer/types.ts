// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type NotificationsListFooterProps = {
  readonly shown: number;
  readonly total: number;
  readonly hasNextPage: boolean;
  readonly loadMoreFailed: boolean;
  readonly onLoadOlder: () => Promise<void>;
};
