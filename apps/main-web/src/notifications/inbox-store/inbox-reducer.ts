// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { applyFiltersChanged } from "./apply-filters-changed.js";
import { applyLoadFailed } from "./apply-load-failed.js";
import { applyLoadStarted } from "./apply-load-started.js";
import { applyMoreLoaded } from "./apply-more-loaded.js";
import { applyPageLoaded } from "./apply-page-loaded.js";
import { markAllReadOptimistic } from "./mark-all-read-optimistic.js";
import { markReadOptimistic } from "./mark-read-optimistic.js";
import { mergeLiveNotification } from "./merge-live-notification.js";
import { revertRead } from "./revert-read.js";
import { setErrorKind } from "./set-error-kind.js";
import type { InboxAction, InboxState } from "./types.js";

export const inboxReducer = (state: InboxState, action: InboxAction): InboxState => {
  switch (action.type) {
    case "loadStarted":
      return applyLoadStarted(state);
    case "loadFailed":
      return applyLoadFailed(state);
    case "filtersChanged":
      return applyFiltersChanged(state, action.filters);
    case "pageLoaded":
      return applyPageLoaded(state, action.page);
    case "moreLoaded":
      return applyMoreLoaded(state, action.page);
    case "loadMoreFailed":
      return setErrorKind(state, "loadMore");
    case "liveNotificationReceived":
      return mergeLiveNotification(state, action.notification);
    case "streamFailed":
      return setErrorKind(state, "stream");
    case "markReadRequested":
      return markReadOptimistic(state, action.notificationId, action.readAt);
    case "markReadReverted":
      return revertRead(state, action.notificationId, action.previousReadAt);
    case "markAllReadRequested":
      return markAllReadOptimistic(state, action.readAt);
    case "markAllReadFailed":
      return setErrorKind(state, "markAllRead");
  }
};
