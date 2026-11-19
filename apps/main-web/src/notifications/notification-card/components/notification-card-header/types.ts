// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { NotificationCategory } from "@offgrid/contracts";

export type NotificationCardHeaderProps = {
  readonly category: NotificationCategory;
  readonly createdAt: string;
  readonly isUnread: boolean;
};
