// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, MaterialIcon, Text } from "@offgrid/ui";
import { NotificationsMarkAllReadButton } from "../notifications-mark-all-read-button/notifications-mark-all-read-button.js";
import {
  notificationsMobileBackStyle,
  notificationsMobileHeadingRowStyle,
  notificationsMobileHeaderStyle,
} from "./styles.js";
import type { NotificationsMobileHeaderProps } from "./types.js";

export const NotificationsMobileHeader = ({
  unreadCount,
  onBack,
  onMarkAllRead,
}: NotificationsMobileHeaderProps) => (
  <div style={notificationsMobileHeaderStyle} data-testid="notifications-mobile-header">
    <div style={notificationsMobileBackStyle}>
      <Button
        type="button"
        variant="ghost"
        size="small"
        onClick={onBack}
        data-testid="notifications-back"
      >
        <MaterialIcon name="arrow_back" size="22px" color="currentColor" />
        <Text variant="action" textId="notifications.page.back" />
      </Button>
    </div>
    <div style={notificationsMobileHeadingRowStyle}>
      <Text variant="heading" textId="notifications.page.heading" />
      <NotificationsMarkAllReadButton unreadCount={unreadCount} onMarkAllRead={onMarkAllRead} />
    </div>
  </div>
);
