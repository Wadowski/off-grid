// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useContext } from "react";
import type { NotificationsInbox } from "../inbox-store/types.js";
import { NotificationsInboxContext } from "./notifications-inbox-context.js";

export const useNotificationsInboxContext = (): NotificationsInbox => {
  const inbox = useContext(NotificationsInboxContext);
  if (inbox === undefined) {
    throw new Error("useNotificationsInboxContext must be used inside NotificationsInboxProvider");
  }
  return inbox;
};
