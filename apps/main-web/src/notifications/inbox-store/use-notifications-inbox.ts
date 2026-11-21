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
import type { InboxAction, InboxFilters, InboxState, NotificationsInbox } from "./types.js";

export const useNotificationsInbox = (): NotificationsInbox => {
  const [state, dispatch] = useReducer(
    inboxReducer,
    INITIAL_INBOX_FILTERS,
    createInitialInboxState,
  );
  const latestState = useRef<InboxState>(state);
  const latestGeneration = useRef(0);

  const dispatchInbox = useCallback((action: InboxAction) => {
    latestState.current = inboxReducer(latestState.current, action);
    dispatch(action);
  }, []);

  const loadWithFilters = useCallback(
    (filters: InboxFilters): Promise<void> => {
      const generation = ++latestGeneration.current;
      return loadInboxPage(dispatchInbox, filters, () => generation === latestGeneration.current);
    },
    [dispatchInbox],
  );

  const reload = useCallback(() => loadWithFilters(latestState.current.filters), [loadWithFilters]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    const controller = new AbortController();
    void subscribeToNotificationStream({
      signal: controller.signal,
      onNotification: (notification) =>
        dispatchInbox({ type: "liveNotificationReceived", notification }),
      onReset: () => void reload(),
      onError: () => dispatchInbox({ type: "streamFailed" }),
    });
    return () => controller.abort();
  }, [reload, dispatchInbox]);

  const setFilters = useCallback(
    (filters: InboxFilters) => {
      dispatchInbox({ type: "filtersChanged", filters });
      void loadWithFilters(filters);
    },
    [dispatchInbox, loadWithFilters],
  );

  const loadMore = useCallback(async () => {
    const { nextCursor, filters } = latestState.current;
    if (nextCursor === null) {
      return;
    }
    const generation = latestGeneration.current;
    await loadMoreInboxPage(
      dispatchInbox,
      filters,
      nextCursor,
      () => generation === latestGeneration.current,
    );
  }, [dispatchInbox]);

  const markRead = useCallback(
    async (notificationId: string) => {
      const item = latestState.current.items.find((candidate) => candidate.id === notificationId);
      if (item !== undefined && item.readAt !== null) {
        return;
      }
      await markReadWithRollback(
        dispatchInbox,
        notificationId,
        item?.readAt ?? null,
        new Date().toISOString(),
      );
    },
    [dispatchInbox],
  );

  const markAllRead = useCallback(
    () => markAllReadWithReload(dispatchInbox, new Date().toISOString(), reload),
    [dispatchInbox, reload],
  );

  return { ...state, setFilters, reload, loadMore, markRead, markAllRead };
};
