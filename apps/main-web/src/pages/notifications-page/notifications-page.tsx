// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { PHONE_CHROME_MEDIA_QUERY } from "../../constants.js";
import { useMediaQuery } from "../../media/use-media-query.js";
import { browserTimeZone, groupByDay, useNotificationsInbox } from "../../notifications/index.js";
import { useOpenNotice } from "../../notifications/use-open-notice.js";
import { NotificationsBody } from "./components/notifications-body/notifications-body.js";
import { NotificationsFilterBar } from "./components/notifications-filter-bar/notifications-filter-bar.js";
import { NotificationsHeader } from "./components/notifications-header/notifications-header.js";
import { NotificationsMobileHeader } from "./components/notifications-mobile-header/notifications-mobile-header.js";
import { useLeaveNotifications } from "./components/notifications-mobile-header/use-leave-notifications.js";
import { filterForOption } from "./filter-for-option.js";
import { optionForFilters } from "./option-for-filters.js";
import { notificationsPageStyle } from "./styles.js";
import type { NotificationsLayout } from "./types.js";

export const NotificationsPage = () => {
  const inbox = useNotificationsInbox();
  const openNotice = useOpenNotice(inbox.markRead);
  const leave = useLeaveNotifications();
  const isPhone = useMediaQuery(PHONE_CHROME_MEDIA_QUERY);
  const layout: NotificationsLayout = isPhone ? "phone" : "desktop";
  const groups = groupByDay(inbox.items, new Date(), browserTimeZone());
  const markAllRead = () => void inbox.markAllRead();
  return (
    <div style={notificationsPageStyle} data-testid="notifications-page">
      {layout === "phone" ? (
        <NotificationsMobileHeader
          unreadCount={inbox.unreadCount}
          onBack={leave}
          onMarkAllRead={markAllRead}
        />
      ) : (
        <NotificationsHeader unreadCount={inbox.unreadCount} onMarkAllRead={markAllRead} />
      )}
      <NotificationsFilterBar
        layout={layout}
        selectedOption={optionForFilters(inbox.filters)}
        totalForSelected={inbox.total}
        onSelect={(option) => inbox.setFilters(filterForOption(option))}
      />
      {inbox.errorKind === "stream" ? (
        <Text variant="status" textId="notifications.liveUpdatesUnavailable" />
      ) : null}
      <NotificationsBody layout={layout} inbox={inbox} groups={groups} onOpen={openNotice} />
    </div>
  );
};
