// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { formatRelativeTime } from "../../../format-relative-time.js";
import {
  notificationCardCategoryStyle,
  notificationCardHeaderStyle,
  notificationCardMetaStyle,
  notificationCardTimeStyle,
  notificationCardUnreadDotStyle,
} from "./styles.js";
import type { NotificationCardHeaderProps } from "./types.js";

export const NotificationCardHeader = ({
  category,
  createdAt,
  isUnread,
}: NotificationCardHeaderProps) => {
  const relativeTime = formatRelativeTime(new Date(), createdAt);

  return (
    <span style={notificationCardHeaderStyle}>
      <Text
        element="span"
        variant="caption"
        textId={`notifications.categories.${category}`}
        style={notificationCardCategoryStyle(category)}
        data-testid="notification-card-category"
      />
      <span style={notificationCardMetaStyle}>
        <Text
          element="span"
          variant="caption"
          textId={relativeTime.textId}
          values={relativeTime.values}
          style={notificationCardTimeStyle}
          data-testid="notification-card-time"
        />
        {isUnread ? (
          <span
            style={notificationCardUnreadDotStyle}
            data-testid="notification-card-unread-dot"
            aria-hidden="true"
          />
        ) : null}
      </span>
    </span>
  );
};
