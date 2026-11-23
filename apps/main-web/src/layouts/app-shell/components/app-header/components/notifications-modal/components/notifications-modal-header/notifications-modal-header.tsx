// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, MaterialIcon, Text } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { NotificationsMarkAllReadButton } from "../../../../../../../../notifications/index.js";
import { NOTIFICATIONS_MODAL_TITLE_ID } from "../../constants.js";
import { notificationsSurfaceTitleRowStyle } from "../../../notifications-surface/styles.js";
import {
  notificationsModalActionsStyle,
  notificationsModalHandleStyle,
  notificationsModalHeaderStyle,
} from "./styles.js";
import type { NotificationsModalHeaderProps } from "./types.js";

export const NotificationsModalHeader = ({
  unreadCount,
  onMarkAllRead,
  onClose,
}: NotificationsModalHeaderProps) => {
  const { t } = useTranslation();
  return (
    <div style={notificationsModalHeaderStyle}>
      <span style={notificationsModalHandleStyle} aria-hidden="true" />
      <div style={notificationsSurfaceTitleRowStyle}>
        <Text
          variant="heading"
          textId="notifications.page.heading"
          id={NOTIFICATIONS_MODAL_TITLE_ID}
        />
        <div style={notificationsModalActionsStyle}>
          <NotificationsMarkAllReadButton unreadCount={unreadCount} onMarkAllRead={onMarkAllRead} />
          <Button
            type="button"
            variant="ghost"
            aria-label={t("notifications.modal.close")}
            onClick={onClose}
            data-testid="notifications-modal-close"
          >
            <MaterialIcon name="close" size="18px" color="currentColor" />
          </Button>
        </div>
      </div>
    </div>
  );
};
