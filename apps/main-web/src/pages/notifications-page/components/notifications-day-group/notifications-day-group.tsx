// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { NotificationCard } from "../../../../notifications/index.js";
import { NotificationsDayGroupTitle } from "./components/notifications-day-group-title/notifications-day-group-title.js";
import {
  notificationsDayGroupCardsStyle,
  notificationsDayGroupHeadingStyle,
  notificationsDayGroupStyle,
} from "./styles.js";
import type { NotificationsDayGroupProps } from "./types.js";

export const NotificationsDayGroup = ({
  group,
  onOpen,
  onMarkRead,
}: NotificationsDayGroupProps) => {
  const isRelativeDay = "textId" in group.label;
  return (
    <section style={notificationsDayGroupStyle} data-testid="notifications-day-group">
      <div style={notificationsDayGroupHeadingStyle}>
        <NotificationsDayGroupTitle label={group.label} />
        {isRelativeDay ? (
          <Text
            element="span"
            variant="caption"
            textId="notifications.updates"
            values={{ count: group.items.length }}
            data-testid="notifications-day-group-count"
          />
        ) : null}
      </div>
      <div style={notificationsDayGroupCardsStyle}>
        {group.items.map((notice) => (
          <NotificationCard
            key={notice.id}
            notice={notice}
            density="full"
            onOpen={onOpen}
            onMarkRead={onMarkRead}
          />
        ))}
      </div>
    </section>
  );
};
