// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import {
  NotificationCard,
  NotificationsEmptyState,
  NotificationsErrorState,
  sliceFirstPage,
} from "../../../../../../../../notifications/index.js";
import { NOTIFICATIONS_POPOVER_LIMIT } from "../../constants.js";
import {
  notificationsPopoverCardRowStyle,
  notificationsPopoverListStyle,
  notificationsPopoverStateStyle,
} from "./styles.js";
import type { NotificationsPopoverListProps } from "./types.js";

export const NotificationsPopoverList = ({ inbox, onOpen }: NotificationsPopoverListProps) => {
  if (inbox.status === "error" && inbox.errorKind === "load") {
    return <NotificationsErrorState layout="sheet" onRetry={() => void inbox.reload()} />;
  }
  if (inbox.status === "loading" && inbox.items.length === 0) {
    return (
      <div style={notificationsPopoverStateStyle}>
        <Text variant="status" textId="notifications.page.loading" role="status" />
      </div>
    );
  }
  if (inbox.items.length === 0) {
    return <NotificationsEmptyState layout="sheet" />;
  }
  return (
    <div style={notificationsPopoverListStyle}>
      {inbox.errorKind === "stream" ? (
        <Text variant="status" textId="notifications.liveUpdatesUnavailable" />
      ) : null}
      {sliceFirstPage(inbox.items, NOTIFICATIONS_POPOVER_LIMIT).map((notice) => (
        <div key={notice.id} style={notificationsPopoverCardRowStyle}>
          <NotificationCard
            notice={notice}
            density="compact"
            onOpen={onOpen}
            onMarkRead={inbox.markRead}
          />
        </div>
      ))}
    </div>
  );
};
