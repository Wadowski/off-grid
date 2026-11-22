// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, MaterialIcon, Text } from "@offgrid/ui";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import markUrl from "../../../../media/offgrid-mark-64.png";
import { useIsNarrow } from "../../../../media/use-is-narrow.js";
import { HeaderSearch } from "./components/header-search/header-search.js";
import { HeaderBell } from "./components/header-bell/header-bell.js";
import { surfaceForViewport } from "./components/header-bell/surface-for-viewport.js";
import type { NotificationsSurface } from "./components/header-bell/types.js";
import { NotificationsModal } from "./components/notifications-modal/notifications-modal.js";

export const AppHeader = () => {
  const { t } = useTranslation();
  const isNarrow = useIsNarrow();
  const [openSurface, setOpenSurface] = useState<NotificationsSurface | undefined>(undefined);
  const toggleNotifications = () =>
    setOpenSurface((current) => (current === undefined ? surfaceForViewport(isNarrow) : undefined));
  const closeNotifications = () => setOpenSurface(undefined);

  useEffect(() => {
    if (!isNarrow && openSurface === "modal") {
      setOpenSurface(undefined);
    }
  }, [isNarrow, openSurface]);

  return (
    <header className="og-header">
      <div className="og-header-start">
        <img className="og-header-brand" src={markUrl} alt="" aria-hidden="true" />
        <HeaderSearch />
      </div>
      <div className="og-header-actions">
        <span className="og-header-pill">
          <MaterialIcon name="sync_saved_locally" size="16px" color="currentColor" />
          <Text variant="label" textId="shell.privateNode" />
        </span>
        <HeaderBell isOpen={openSurface !== undefined} onToggle={toggleNotifications} />
        <span className="og-header-apps">
          <Button variant="ghost" aria-label={t("shell.apps")} disabled>
            <MaterialIcon name="apps" size="20px" color="currentColor" />
          </Button>
        </span>
      </div>
      {openSurface === "modal" ? <NotificationsModal onClose={closeNotifications} /> : null}
    </header>
  );
};
