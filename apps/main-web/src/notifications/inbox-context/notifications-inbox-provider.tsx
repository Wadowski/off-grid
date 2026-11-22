// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useNotificationsInbox } from "../inbox-store/use-notifications-inbox.js";
import { NotificationsInboxContext } from "./notifications-inbox-context.js";
import type { NotificationsInboxProviderProps } from "./types.js";

export const NotificationsInboxProvider = ({ children }: NotificationsInboxProviderProps) => {
  const inbox = useNotificationsInbox();
  return (
    <NotificationsInboxContext.Provider value={inbox}>{children}</NotificationsInboxContext.Provider>
  );
};
