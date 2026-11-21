// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Dispatch } from "react";
import { markAllNotificationsRead } from "../notifications-api.js";
import type { InboxAction } from "./types.js";

export const markAllReadWithReload = async (
  dispatch: Dispatch<InboxAction>,
  readAt: string,
  reload: () => Promise<void>,
): Promise<void> => {
  dispatch({ type: "markAllReadRequested", readAt });
  try {
    await markAllNotificationsRead();
  } catch {
    dispatch({ type: "markAllReadFailed" });
    await reload();
  }
};
