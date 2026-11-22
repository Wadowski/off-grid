// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { NotificationsMarkAllReadButton } from "../../../../../../../../notifications/index.js";
import { NOTIFICATIONS_POPOVER_TITLE_ID } from "../../constants.js";
import { notificationsPopoverHeaderStyle } from "./styles.js";
import type { NotificationsPopoverHeaderProps } from "./types.js";

export const NotificationsPopoverHeader = ({
  unreadCount,
  onMarkAllRead,
}: NotificationsPopoverHeaderProps) => (
  <div style={notificationsPopoverHeaderStyle}>
    <Text
      variant="heading"
      textId="notifications.page.heading"
      id={NOTIFICATIONS_POPOVER_TITLE_ID}
    />
    <NotificationsMarkAllReadButton unreadCount={unreadCount} onMarkAllRead={onMarkAllRead} />
  </div>
);
