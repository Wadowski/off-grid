// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, MaterialIcon } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { useNotificationsInboxContext } from "../../../../../../notifications/index.js";
import { HeaderBellBadge } from "./components/header-bell-badge/header-bell-badge.js";
import { headerBellAnchorStyle } from "./styles.js";
import type { HeaderBellProps } from "./types.js";

export const HeaderBell = ({ isOpen, onToggle }: HeaderBellProps) => {
  const { t } = useTranslation();
  const { unreadCount, status } = useNotificationsInboxContext();
  const visibleCount = status === "ready" ? unreadCount : 0;
  const accessibleName =
    visibleCount > 0
      ? t("notifications.bell.labelUnread", { count: visibleCount })
      : t("notifications.bell.label");

  return (
    <span style={headerBellAnchorStyle}>
      <Button
        variant="ghost"
        aria-label={accessibleName}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        data-testid="header-bell"
        onClick={onToggle}
      >
        <MaterialIcon name="notifications" size="20px" color="currentColor" />
      </Button>
      {visibleCount > 0 ? <HeaderBellBadge count={visibleCount} /> : null}
    </span>
  );
};
