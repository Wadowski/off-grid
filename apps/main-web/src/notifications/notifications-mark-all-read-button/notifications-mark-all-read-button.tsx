// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import type { NotificationsMarkAllReadButtonProps } from "./types.js";

export const NotificationsMarkAllReadButton = ({
  unreadCount,
  onMarkAllRead,
}: NotificationsMarkAllReadButtonProps) => (
  <Button
    type="button"
    variant="ghost"
    size="small"
    disabled={unreadCount === 0}
    onClick={onMarkAllRead}
    data-testid="notifications-mark-all-read"
  >
    <Text variant="action" textId="notifications.markAllRead" />
  </Button>
);
