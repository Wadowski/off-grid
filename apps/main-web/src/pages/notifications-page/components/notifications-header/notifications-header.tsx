// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { NotificationsMarkAllReadButton } from "../notifications-mark-all-read-button/notifications-mark-all-read-button.js";
import {
  notificationsHeaderActionsStyle,
  notificationsHeaderStyle,
  notificationsHeaderTextStyle,
} from "./styles.js";
import type { NotificationsHeaderProps } from "./types.js";

export const NotificationsHeader = ({ unreadCount, onMarkAllRead }: NotificationsHeaderProps) => (
  <div style={notificationsHeaderStyle} data-testid="notifications-header">
    <div style={notificationsHeaderActionsStyle}>
      <NotificationsMarkAllReadButton unreadCount={unreadCount} onMarkAllRead={onMarkAllRead} />
    </div>
    <div style={notificationsHeaderTextStyle}>
      <Text variant="heading" textId="notifications.page.heading" />
      <Text variant="body" textId="notifications.page.description" />
    </div>
  </div>
);
