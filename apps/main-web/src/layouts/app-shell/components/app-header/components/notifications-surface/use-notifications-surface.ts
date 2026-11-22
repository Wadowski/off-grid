// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  useNotificationsInboxContext,
  useOpenNotice,
} from "../../../../../../notifications/index.js";
import type { NotificationItem } from "../../../../../../notifications/index.js";
import type { NotificationsSurfaceControls } from "./types.js";

export const useNotificationsSurface = (): NotificationsSurfaceControls => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const navigate = useNavigate();
  const inbox = useNotificationsInboxContext();
  const openNotice = useOpenNotice(inbox.markRead);
  const closeSurface = () => dialogRef.current?.close();
  const openFromSurface = async (notice: NotificationItem) => {
    await openNotice(notice);
    if (notice.data.eventId !== undefined) {
      closeSurface();
    }
  };
  const viewAll = () => {
    navigate("/notifications");
    closeSurface();
  };
  return { dialogRef, openFromSurface, viewAll };
};
