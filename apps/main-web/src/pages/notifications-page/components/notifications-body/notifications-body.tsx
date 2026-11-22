// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { NotificationsDayGroup } from "../notifications-day-group/notifications-day-group.js";
import { NotificationsEmptyState } from "../notifications-empty-state/notifications-empty-state.js";
import { NotificationsErrorState } from "../notifications-error-state/notifications-error-state.js";
import { NotificationsListFooter } from "../notifications-list-footer/notifications-list-footer.js";
import { notificationsBodyStyle, notificationsLoadingStyle } from "./styles.js";
import type { NotificationsBodyProps } from "./types.js";

export const NotificationsBody = ({ layout, inbox, groups, onOpen }: NotificationsBodyProps) => {
  if (inbox.status === "error" && inbox.errorKind === "load") {
    return <NotificationsErrorState onRetry={() => void inbox.reload()} />;
  }
  if (inbox.status === "loading" && inbox.items.length === 0) {
    return (
      <div style={notificationsLoadingStyle}>
        <Text variant="status" textId="notifications.page.loading" role="status" />
      </div>
    );
  }
  if (inbox.items.length === 0) {
    return <NotificationsEmptyState />;
  }
  return (
    <div style={notificationsBodyStyle}>
      {groups.map((group) => (
        <NotificationsDayGroup
          key={group.dateKey}
          group={group}
          onOpen={onOpen}
          onMarkRead={inbox.markRead}
        />
      ))}
      <NotificationsListFooter
        layout={layout}
        shown={inbox.items.length}
        total={inbox.total}
        hasNextPage={inbox.nextCursor !== null}
        loadMoreFailed={inbox.errorKind === "loadMore"}
        onLoadOlder={inbox.loadMore}
      />
    </div>
  );
};
