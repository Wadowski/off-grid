// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, MaterialIcon, Text, cssVar } from "@offgrid/ui";
import { useEffect, useRef, useState } from "react";
import {
  notificationsCaughtUpStyle,
  notificationsListFooterRowStyle,
  notificationsListFooterStyle,
} from "./styles.js";
import type { NotificationsListFooterProps } from "./types.js";

export const NotificationsListFooter = ({
  layout,
  shown,
  total,
  hasNextPage,
  loadMoreFailed,
  onLoadOlder,
}: NotificationsListFooterProps) => {
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const loadOlder = async () => {
    setIsLoadingOlder(true);
    try {
      await onLoadOlder();
    } finally {
      if (isMounted.current) {
        setIsLoadingOlder(false);
      }
    }
  };

  const loadOlderButton = hasNextPage ? (
    <Button
      type="button"
      variant="secondary"
      size="small"
      fullWidth={layout === "phone"}
      disabled={isLoadingOlder}
      onClick={loadOlder}
      data-testid="notifications-load-older"
    >
      <Text variant="action" textId="notifications.loadOlder" />
    </Button>
  ) : null;

  return (
    <div style={notificationsListFooterStyle} data-testid="notifications-list-footer">
      {layout === "desktop" ? (
        <div style={notificationsListFooterRowStyle}>
          <Text
            element="span"
            variant="caption"
            textId="notifications.page.showing"
            values={{ shown, total }}
            data-testid="notifications-showing"
          />
          {loadOlderButton}
        </div>
      ) : (
        loadOlderButton
      )}
      {layout === "phone" && !hasNextPage ? (
        <div style={notificationsCaughtUpStyle} data-testid="notifications-caught-up">
          <MaterialIcon name="inventory" size="1rem" color={cssVar("color-muted")} />
          <Text element="span" variant="caption" textId="notifications.page.caughtUp" />
        </div>
      ) : null}
      {loadMoreFailed ? <Text variant="error" textId="notifications.error.loadMore" /> : null}
    </div>
  );
};
