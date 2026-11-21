// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useCallback, useEffect, useReducer, useRef } from "react";
import { subscribeToNotificationStream } from "../subscribe-to-notification-stream.js";
import { INITIAL_INBOX_FILTERS } from "./constants.js";
import { createInitialInboxState } from "./create-initial-inbox-state.js";
import { inboxReducer } from "./inbox-reducer.js";
import { loadInboxPage } from "./load-inbox-page.js";
import { loadMoreInboxPage } from "./load-more-inbox-page.js";
import { markAllReadWithReload } from "./mark-all-read-with-reload.js";
import { markReadWithRollback } from "./mark-read-with-rollback.js";
import type { InboxFilters, InboxState, NotificationsInbox } from "./types.js";

export const useNotificationsInbox = (): NotificationsInbox => {
  const [state, dispatch] = useReducer(
    inboxReducer,
    INITIAL_INBOX_FILTERS,
    createInitialInboxState,
  );
  const latestState = useRef<InboxState>(state);
  const latestGeneration = useRef(0);

  useEffect(() => {
    latestState.current = state;
  }, [state]);

  const loadWithFilters = useCallback((filters: InboxFilters): Promise<void> => {
    const generation = ++latestGeneration.current;
    return loadInboxPage(dispatch, filters, () => generation === latestGeneration.current);
  }, []);

  const reload = useCallback(() => loadWithFilters(latestState.current.filters), [loadWithFilters]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    const controller = new AbortController();
    void subscribeToNotificationStream({
      signal: controller.signal,
      onNotification: (notification) =>
        dispatch({ type: "liveNotificationReceived", notification }),
      onReset: () => void reload(),
      onError: () => dispatch({ type: "streamFailed" }),
    });
    return () => controller.abort();
  }, [reload]);

  const setFilters = useCallback(
    (filters: InboxFilters) => {
      dispatch({ type: "filtersChanged", filters });
      void loadWithFilters(filters);
    },
    [loadWithFilters],
  );

  const loadMore = useCallback(async () => {
    const { nextCursor, filters } = latestState.current;
    if (nextCursor === null) {
      return;
    }
    const generation = latestGeneration.current;
    await loadMoreInboxPage(
      dispatch,
      filters,
      nextCursor,
      () => generation === latestGeneration.current,
    );
  }, []);

  const markRead = useCallback(async (notificationId: string) => {
    const previousReadAt =
      latestState.current.items.find((item) => item.id === notificationId)?.readAt ?? null;
    await markReadWithRollback(dispatch, notificationId, previousReadAt, new Date().toISOString());
  }, []);

  const markAllRead = useCallback(
    () => markAllReadWithReload(dispatch, new Date().toISOString(), reload),
    [reload],
  );

  return { ...state, setFilters, reload, loadMore, markRead, markAllRead };
};
