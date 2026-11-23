// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import {
  NotificationCard,
  NotificationsEmptyState,
  NotificationsErrorState,
  sliceFirstPage,
} from "../../../../../../../../notifications/index.js";
import {
  notificationsSurfaceCardRowStyle,
  notificationsSurfaceListStyle,
  notificationsSurfaceStateStyle,
} from "../../styles.js";
import type { NotificationsSurfaceListProps } from "./types.js";

export const NotificationsSurfaceList = ({
  inbox,
  onOpen,
  limit,
}: NotificationsSurfaceListProps) => {
  if (inbox.status === "error" && inbox.errorKind === "load") {
    return <NotificationsErrorState layout="sheet" onRetry={() => void inbox.reload()} />;
  }
  if (inbox.status === "loading" && inbox.items.length === 0) {
    return (
      <div style={notificationsSurfaceStateStyle}>
        <Text variant="status" textId="notifications.page.loading" role="status" />
      </div>
    );
  }
  if (inbox.items.length === 0) {
    return <NotificationsEmptyState layout="sheet" />;
  }
  return (
    <div style={notificationsSurfaceListStyle}>
      {inbox.errorKind === "stream" ? (
        <Text variant="status" textId="notifications.liveUpdatesUnavailable" />
      ) : null}
      {sliceFirstPage(inbox.items, limit).map((notice) => (
        <div key={notice.id} style={notificationsSurfaceCardRowStyle}>
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
