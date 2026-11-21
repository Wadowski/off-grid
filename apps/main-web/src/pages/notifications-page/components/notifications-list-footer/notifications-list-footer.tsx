// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import { useState } from "react";
import { notificationsListFooterStyle } from "./styles.js";
import type { NotificationsListFooterProps } from "./types.js";

export const NotificationsListFooter = ({
  shown,
  total,
  hasNextPage,
  loadMoreFailed,
  onLoadOlder,
}: NotificationsListFooterProps) => {
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);

  const loadOlder = async () => {
    setIsLoadingOlder(true);
    try {
      await onLoadOlder();
    } finally {
      setIsLoadingOlder(false);
    }
  };

  return (
    <div style={notificationsListFooterStyle} data-testid="notifications-list-footer">
      <Text
        element="span"
        variant="caption"
        textId="notifications.page.showing"
        values={{ shown, total }}
        data-testid="notifications-showing"
      />
      {loadMoreFailed ? <Text variant="error" textId="notifications.error.loadMore" /> : null}
      {hasNextPage ? (
        <Button
          type="button"
          variant="secondary"
          size="small"
          disabled={isLoadingOlder}
          onClick={loadOlder}
          data-testid="notifications-load-older"
        >
          <Text variant="action" textId="notifications.loadOlder" />
        </Button>
      ) : null}
    </div>
  );
};
