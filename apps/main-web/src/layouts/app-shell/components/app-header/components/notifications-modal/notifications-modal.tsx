// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Dialog } from "@offgrid/ui";
import {
  filterForOption,
  NotificationsFilterBar,
  optionForFilters,
  useNotificationsInboxContext,
} from "../../../../../../notifications/index.js";
import { NOTIFICATIONS_MODAL_TITLE_ID } from "./constants.js";
import { NotificationsModalHeader } from "./components/notifications-modal-header/notifications-modal-header.js";
import { NotificationsSurfaceFooter } from "../notifications-surface/components/notifications-surface-footer/notifications-surface-footer.js";
import { NotificationsSurfaceList } from "../notifications-surface/components/notifications-surface-list/notifications-surface-list.js";
import { useNotificationsSurface } from "../notifications-surface/use-notifications-surface.js";
import {
  notificationsModalChipsStyle,
  notificationsModalDialogStyle,
  notificationsModalSheetStyle,
} from "./styles.js";
import type { NotificationsModalProps } from "./types.js";

export const NotificationsModal = ({ onClose }: NotificationsModalProps) => {
  const { dialogRef, openFromSurface, viewAll } = useNotificationsSurface();
  const inbox = useNotificationsInboxContext();
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
          onClose={() => dialogRef.current?.close()}
        />
        <div style={notificationsModalChipsStyle}>
          <NotificationsFilterBar
            layout="phone"
            selectedOption={optionForFilters(inbox.filters)}
            totalForSelected={inbox.total}
            onSelect={(option) => inbox.setFilters(filterForOption(option))}
          />
        </div>
        <NotificationsSurfaceList inbox={inbox} onOpen={openFromSurface} />
        <NotificationsSurfaceFooter
          onViewAll={viewAll}
          variant="primary"
          testId="notifications-modal-view-all"
          textId="notifications.modal.viewAll"
        />
      </div>
    </Dialog>
  );
};
