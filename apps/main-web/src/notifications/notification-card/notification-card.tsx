// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, IconTile, MaterialIcon, Text, VisuallyHidden } from "@offgrid/ui";
import { noticeCopy } from "./notice-copy.js";
import { NotificationCardAction } from "./components/notification-card-action/notification-card-action.js";
import { NotificationCardHeader } from "./components/notification-card-header/notification-card-header.js";
import {
  notificationCardActivatorStyle,
  notificationCardAccentBarStyle,
  notificationCardBodyStyle,
  notificationCardRootStyle,
  notificationCardTextStyle,
  notificationCardTitleStyle,
} from "./styles.js";
import type { NotificationCardProps } from "./types.js";

export const NotificationCard = ({
  notice,
  density,
  onOpen,
  onMarkRead,
}: NotificationCardProps) => {
  const copy = noticeCopy(notice.type);
  const isUnread = notice.readAt === null;

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
      <button
        type="button"
        className="og-focusable"
        style={notificationCardActivatorStyle}
        data-testid="notification-card-activate"
        onClick={markReadOnActivate}
      >
        <IconTile
          size={cssVar("space-9")}
          background={cssVar("color-accent-soft")}
          color={cssVar("color-primary")}
        >
          <MaterialIcon name={copy.iconName} size="1.125rem" color={cssVar("color-primary")} />
        </IconTile>
        <span style={notificationCardTextStyle}>
          <NotificationCardHeader
            category={notice.category}
            createdAt={notice.createdAt}
            isUnread={isUnread}
          />
          <Text
            element="span"
            variant="body"
            textId={copy.titleId}
            style={notificationCardTitleStyle(isUnread)}
            data-testid="notification-card-title"
          />
          <Text
            element="span"
            variant="status"
            textId={copy.bodyId}
            style={notificationCardBodyStyle}
            data-testid="notification-card-body"
          />
          <VisuallyHidden>
            <Text
              element="span"
              variant="caption"
              textId={isUnread ? "notifications.card.unread" : "notifications.card.read"}
            />
          </VisuallyHidden>
        </span>
      </button>
      {copy.actionId === undefined ? null : (
        <NotificationCardAction actionId={copy.actionId} onActivate={() => onOpen(notice)} />
      )}
    </div>
  );

  return card;
};
