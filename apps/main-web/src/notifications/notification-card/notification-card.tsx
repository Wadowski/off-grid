// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useTranslation } from "react-i18next";
import { Card, cssVar, IconTile, MaterialIcon, Text } from "@offgrid/ui";
import { formatRelativeTime } from "../format-relative-time.js";
import { handleActivateKeyDown } from "./handle-activate-key-down.js";
import { noticeCopy } from "./notice-copy.js";
import { NotificationCardAction } from "./components/notification-card-action/notification-card-action.js";
import {
  notificationCardActivatorStyle,
  notificationCardAccentBarStyle,
  notificationCardBodyStyle,
  notificationCardCategoryStyle,
  notificationCardHeaderStyle,
  notificationCardMetaStyle,
  notificationCardRootStyle,
  notificationCardTextStyle,
  notificationCardTimeStyle,
  notificationCardTitleStyle,
  notificationCardUnreadDotStyle,
} from "./styles.js";
import type { NotificationCardProps } from "./types.js";

export const NotificationCard = ({
  notice,
  density,
  onOpen,
  onMarkRead,
}: NotificationCardProps) => {
  const { t } = useTranslation();
  const copy = noticeCopy(notice.type);
  const isUnread = notice.readAt === null;
  const relativeTime = formatRelativeTime(new Date(), notice.createdAt);
  const accessibleName = t("notifications.card.nameWithState", {
    title: t(copy.titleId),
    state: t(isUnread ? "notifications.card.unread" : "notifications.card.read"),
  });

  const markReadOnActivate = () => {
    if (isUnread) {
      onMarkRead(notice.id);
    }
  };

  const card = (
    <div
      style={notificationCardRootStyle(density)}
      data-testid="notification-card"
      data-density={density}
      data-unread={isUnread}
    >
      {isUnread && density === "full" ? (
        <span
          style={notificationCardAccentBarStyle}
          data-testid="notification-card-accent-bar"
          aria-hidden="true"
        />
      ) : null}
      <div
        role="button"
        tabIndex={0}
        className="og-focusable"
        aria-label={accessibleName}
        style={notificationCardActivatorStyle}
        data-testid="notification-card-activate"
        onClick={markReadOnActivate}
        onKeyDown={(event) => handleActivateKeyDown(markReadOnActivate, event)}
      >
        <IconTile
          size={cssVar("space-9")}
          background={cssVar("color-accent-soft")}
          color={cssVar("color-primary")}
        >
          <MaterialIcon name={copy.iconName} size="1.125rem" color={cssVar("color-primary")} />
        </IconTile>
        <div style={notificationCardTextStyle}>
          <div style={notificationCardHeaderStyle}>
            <Text
              variant="caption"
              textId={`notifications.categories.${notice.category}`}
              style={notificationCardCategoryStyle(notice.category)}
              data-testid="notification-card-category"
            />
            <div style={notificationCardMetaStyle}>
              <Text
                variant="caption"
                textId={relativeTime.textId}
                values={relativeTime.values}
                style={notificationCardTimeStyle}
                data-testid="notification-card-time"
              />
              {isUnread ? (
                <span
                  style={notificationCardUnreadDotStyle}
                  data-testid="notification-card-unread-dot"
                />
              ) : null}
            </div>
          </div>
          <Text
            variant="body"
            textId={copy.titleId}
            style={notificationCardTitleStyle(isUnread)}
            data-testid="notification-card-title"
          />
          <Text
            variant="status"
            textId={copy.bodyId}
            style={notificationCardBodyStyle}
            data-testid="notification-card-body"
          />
        </div>
      </div>
      {copy.actionId === undefined ? null : (
        <NotificationCardAction actionId={copy.actionId} onActivate={() => onOpen(notice)} />
      )}
    </div>
  );

  return density === "full" ? <Card>{card}</Card> : card;
};
