// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Dialog } from "@offgrid/ui";
import {
  filterForOption,
  NotificationsFilterBar,
  optionForFilters,
  useNotificationsInboxContext,
} from "../../../../../../notifications/index.js";
import { NOTIFICATIONS_POPOVER_LIMIT, NOTIFICATIONS_POPOVER_TITLE_ID } from "./constants.js";
import { NotificationsPopoverHeader } from "./components/notifications-popover-header/notifications-popover-header.js";
import { NotificationsSurfaceFooter } from "../notifications-surface/components/notifications-surface-footer/notifications-surface-footer.js";
import { NotificationsSurfaceList } from "../notifications-surface/components/notifications-surface-list/notifications-surface-list.js";
import { useNotificationsSurface } from "../notifications-surface/use-notifications-surface.js";
import {
  notificationsPopoverChipsStyle,
  notificationsPopoverDialogStyle,
  notificationsPopoverFooterStyle,
  notificationsPopoverSheetStyle,
} from "./styles.js";
import type { NotificationsPopoverProps } from "./types.js";

export const NotificationsPopover = ({ onClose }: NotificationsPopoverProps) => {
  const { dialogRef, openFromSurface, viewAll } = useNotificationsSurface();
  const inbox = useNotificationsInboxContext();
  return (
    <Dialog
      dialogRef={dialogRef}
      labelledBy={NOTIFICATIONS_POPOVER_TITLE_ID}
      onClose={onClose}
      backdrop="glossy"
      dismissOnBackdropClick
      testId="notifications-popover"
      style={notificationsPopoverDialogStyle}
    >
      <div style={notificationsPopoverSheetStyle}>
        <NotificationsPopoverHeader
          unreadCount={inbox.unreadCount}
          onMarkAllRead={() => void inbox.markAllRead()}
        />
        <div style={notificationsPopoverChipsStyle}>
          <NotificationsFilterBar
            layout="popover"
            selectedOption={optionForFilters(inbox.filters)}
            totalForSelected={inbox.total}
            onSelect={(option) => inbox.setFilters(filterForOption(option))}
          />
        </div>
        <NotificationsSurfaceList
          inbox={inbox}
          onOpen={openFromSurface}
          limit={NOTIFICATIONS_POPOVER_LIMIT}
        />
        <NotificationsSurfaceFooter
          onViewAll={viewAll}
          variant="secondary"
          testId="notifications-popover-view-all"
          textId="notifications.popover.viewAll"
          style={notificationsPopoverFooterStyle}
        />
      </div>
    </Dialog>
  );
};
