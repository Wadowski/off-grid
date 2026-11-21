// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type NotificationsHeaderProps = {
  readonly unreadCount: number;
  readonly onMarkAllRead: () => void;
};
