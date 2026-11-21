// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Dispatch } from "react";
import { listNotifications } from "../notifications-api.js";
import { toListOptions } from "./to-list-options.js";
import type { InboxAction, InboxFilters } from "./types.js";

export const loadMoreInboxPage = async (
  dispatch: Dispatch<InboxAction>,
  filters: InboxFilters,
  cursor: string,
  isCurrent: () => boolean,
): Promise<void> => {
  try {
    const page = await listNotifications({ ...toListOptions(filters), cursor });
    if (isCurrent()) {
      dispatch({ type: "moreLoaded", page });
    }
  } catch {
    if (isCurrent()) {
      dispatch({ type: "loadMoreFailed" });
    }
  }
};
