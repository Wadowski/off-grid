// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Dispatch } from "react";
import { markNotificationRead } from "../notifications-api.js";
import type { InboxAction } from "./types.js";

export const markReadWithRollback = async (
  dispatch: Dispatch<InboxAction>,
  notificationId: string,
  previousReadAt: string | null,
  readAt: string,
): Promise<void> => {
  dispatch({ type: "markReadRequested", notificationId, readAt });
  try {
    await markNotificationRead(notificationId);
  } catch {
    dispatch({ type: "markReadReverted", notificationId, previousReadAt });
  }
};
