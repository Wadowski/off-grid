// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import { NotificationCard, sliceFirstPage } from "../../../../../../../../notifications/index.js";
import {
  notificationsModalCardRowStyle,
  notificationsModalListStyle,
  notificationsModalStateStyle,
} from "./styles.js";
import type { NotificationsModalListProps } from "./types.js";

export const NotificationsModalList = ({ inbox, onOpen }: NotificationsModalListProps) => {
  if (inbox.status === "error" && inbox.errorKind === "load") {
    return (
      <div style={notificationsModalStateStyle} data-testid="notifications-modal-error">
        <Text variant="subheading" textId="notifications.error.title" />
        <Button type="button" variant="secondary" size="small" onClick={() => void inbox.reload()}>
          <Text variant="action" textId="notifications.error.retry" />
        </Button>
      </div>
    );
  }
  if (inbox.status === "loading" && inbox.items.length === 0) {
    return (
      <div style={notificationsModalStateStyle}>
        <Text variant="status" textId="notifications.page.loading" role="status" />
      </div>
    );
  }
  if (inbox.items.length === 0) {
    return (
      <div style={notificationsModalStateStyle} data-testid="notifications-modal-empty">
        <Text variant="subheading" textId="notifications.empty.title" />
        <Text variant="body" textId="notifications.empty.body" />
      </div>
    );
  }
  return (
    <div style={notificationsModalListStyle}>
      {inbox.errorKind === "stream" ? (
        <Text variant="status" textId="notifications.liveUpdatesUnavailable" />
      ) : null}
      {sliceFirstPage(inbox.items).map((notice) => (
        <div key={notice.id} style={notificationsModalCardRowStyle}>
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
