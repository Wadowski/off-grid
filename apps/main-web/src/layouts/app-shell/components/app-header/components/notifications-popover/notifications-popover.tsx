// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Dialog } from "@offgrid/ui";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  filterForOption,
  NotificationsFilterBar,
  optionForFilters,
  useNotificationsInboxContext,
  useOpenNotice,
} from "../../../../../../notifications/index.js";
import type { NotificationItem } from "../../../../../../notifications/index.js";
import { NOTIFICATIONS_POPOVER_TITLE_ID } from "./constants.js";
import { NotificationsPopoverFooter } from "./components/notifications-popover-footer/notifications-popover-footer.js";
import { NotificationsPopoverHeader } from "./components/notifications-popover-header/notifications-popover-header.js";
import { NotificationsPopoverList } from "./components/notifications-popover-list/notifications-popover-list.js";
import {
  notificationsPopoverChipsStyle,
  notificationsPopoverDialogStyle,
  notificationsPopoverSheetStyle,
} from "./styles.js";
import type { NotificationsPopoverProps } from "./types.js";

export const NotificationsPopover = ({ onClose }: NotificationsPopoverProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const navigate = useNavigate();
  const inbox = useNotificationsInboxContext();
  const openNotice = useOpenNotice(inbox.markRead);
  const closePopover = () => dialogRef.current?.close();
  const openFromPopover = async (notice: NotificationItem) => {
    await openNotice(notice);
    if (notice.data.eventId !== undefined) {
      closePopover();
    }
  };
  const viewAll = () => {
    navigate("/notifications");
    closePopover();
  };
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
        <NotificationsPopoverList inbox={inbox} onOpen={openFromPopover} />
        <NotificationsPopoverFooter onViewAll={viewAll} />
      </div>
    </Dialog>
  );
};
