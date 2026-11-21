// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Dispatch } from "react";
import { listNotifications } from "../notifications-api.js";
import { toListOptions } from "./to-list-options.js";
import type { InboxAction, InboxFilters } from "./types.js";

export const loadInboxPage = async (
  dispatch: Dispatch<InboxAction>,
  filters: InboxFilters,
  isCurrent: () => boolean,
): Promise<void> => {
  dispatch({ type: "loadStarted" });
  try {
    const page = await listNotifications(toListOptions(filters));
    if (isCurrent()) {
      dispatch({ type: "pageLoaded", page });
    }
  } catch {
    if (isCurrent()) {
      dispatch({ type: "loadFailed" });
    }
  }
};
