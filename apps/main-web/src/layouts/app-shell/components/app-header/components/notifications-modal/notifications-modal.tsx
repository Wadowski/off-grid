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
} from "../../../../../../notifications/index.js";
import type { NotificationItem } from "../../../../../../notifications/inbox-store/types.js";
import { useOpenNotice } from "../../../../../../notifications/use-open-notice.js";
import { NOTIFICATIONS_MODAL_TITLE_ID } from "./constants.js";
import { NotificationsModalFooter } from "./components/notifications-modal-footer/notifications-modal-footer.js";
import { NotificationsModalHeader } from "./components/notifications-modal-header/notifications-modal-header.js";
import { NotificationsModalList } from "./components/notifications-modal-list/notifications-modal-list.js";
import { notificationsModalDialogStyle, notificationsModalSheetStyle } from "./styles.js";
import type { NotificationsModalProps } from "./types.js";

export const NotificationsModal = ({ onClose }: NotificationsModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const navigate = useNavigate();
  const inbox = useNotificationsInboxContext();
  const openNotice = useOpenNotice(inbox.markRead);
  const closeSheet = () => dialogRef.current?.close();
  const openFromSheet = async (notice: NotificationItem) => {
    await openNotice(notice);
    if (notice.data.eventId !== undefined) {
      closeSheet();
    }
  };
  const viewAll = () => {
    navigate("/notifications");
    closeSheet();
  };
  return (
    <Dialog
      dialogRef={dialogRef}
      labelledBy={NOTIFICATIONS_MODAL_TITLE_ID}
      onClose={onClose}
      backdrop="glossy"
      dismissOnBackdropClick
      testId="notifications-modal"
      style={notificationsModalDialogStyle}
    >
      <div style={notificationsModalSheetStyle}>
        <NotificationsModalHeader
          unreadCount={inbox.unreadCount}
          onMarkAllRead={() => void inbox.markAllRead()}
          onClose={closeSheet}
        />
        <NotificationsFilterBar
          layout="phone"
          selectedOption={optionForFilters(inbox.filters)}
          totalForSelected={inbox.total}
          onSelect={(option) => inbox.setFilters(filterForOption(option))}
        />
        <NotificationsModalList inbox={inbox} onOpen={openFromSheet} />
        <NotificationsModalFooter onViewAll={viewAll} />
      </div>
    </Dialog>
  );
};
