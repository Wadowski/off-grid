// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { browserTimeZone, groupByDay, useNotificationsInbox } from "../../notifications/index.js";
import { useOpenNotice } from "../../notifications/use-open-notice.js";
import { NotificationsBody } from "./components/notifications-body/notifications-body.js";
import { NotificationsFilterBar } from "./components/notifications-filter-bar/notifications-filter-bar.js";
import { NotificationsHeader } from "./components/notifications-header/notifications-header.js";
import { filterForOption } from "./filter-for-option.js";
import { notificationsPageStyle } from "./styles.js";
import { optionForFilters } from "./option-for-filters.js";

export const NotificationsPage = () => {
  const inbox = useNotificationsInbox();
  const openNotice = useOpenNotice(inbox.markRead);
  const groups = groupByDay(inbox.items, new Date(), browserTimeZone());
  return (
    <div style={notificationsPageStyle} data-testid="notifications-page">
      <NotificationsHeader
        unreadCount={inbox.unreadCount}
        onMarkAllRead={() => void inbox.markAllRead()}
      />
      <NotificationsFilterBar
        layout="desktop"
        selectedOption={optionForFilters(inbox.filters)}
        totalForSelected={inbox.total}
        onSelect={(option) => inbox.setFilters(filterForOption(option))}
      />
      {inbox.errorKind === "stream" ? (
        <Text variant="status" textId="notifications.liveUpdatesUnavailable" />
      ) : null}
      <NotificationsBody layout="desktop" inbox={inbox} groups={groups} onOpen={openNotice} />
    </div>
  );
};
