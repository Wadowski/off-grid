// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import {
  notificationsHeaderActionsStyle,
  notificationsHeaderStyle,
  notificationsHeaderTextStyle,
} from "./styles.js";
import type { NotificationsHeaderProps } from "./types.js";

export const NotificationsHeader = ({ unreadCount, onMarkAllRead }: NotificationsHeaderProps) => (
  <div style={notificationsHeaderStyle} data-testid="notifications-header">
    <div style={notificationsHeaderActionsStyle}>
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
    </div>
    <div style={notificationsHeaderTextStyle}>
      <Text variant="heading" textId="notifications.page.heading" />
      <Text variant="body" textId="notifications.page.description" />
    </div>
  </div>
);
