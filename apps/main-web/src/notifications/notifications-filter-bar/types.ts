// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { NotificationFilterOption, NotificationsLayout } from "../../types.js";

export type NotificationsFilterBarProps = {
  readonly layout: NotificationsLayout;
  readonly selectedOption: NotificationFilterOption;
  readonly totalForSelected: number;
  readonly onSelect: (option: NotificationFilterOption) => void;
};
