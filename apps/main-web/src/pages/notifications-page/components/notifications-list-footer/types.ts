// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { NotificationsLayout } from "../../../../notifications/types.js";

export type NotificationsListFooterProps = {
  readonly layout: NotificationsLayout;
  readonly shown: number;
  readonly total: number;
  readonly hasNextPage: boolean;
  readonly loadMoreFailed: boolean;
  readonly onLoadOlder: () => Promise<void>;
};
