// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { components, Notification, NotificationListOptions } from "@offgrid/api-client";

export type NotificationItem = Notification;
export type NotificationPage = components["schemas"]["NotificationList"];
export type InboxCategory = NonNullable<NotificationListOptions["category"]>;

export type InboxFilters = {
  readonly category?: InboxCategory;
  readonly unread?: boolean;
};

export type InboxStatus = "loading" | "ready" | "error";

export type InboxErrorKind = "load" | "loadMore" | "stream" | "markRead" | "markAllRead";

export type InboxState = {
  readonly items: readonly NotificationItem[];
  readonly filters: InboxFilters;
  readonly nextCursor: string | null;
  readonly unreadCount: number;
  readonly status: InboxStatus;
  readonly errorKind: InboxErrorKind | undefined;
};

export type InboxAction =
  | { readonly type: "loadStarted" }
  | { readonly type: "loadFailed" }
  | { readonly type: "filtersChanged"; readonly filters: InboxFilters }
  | { readonly type: "pageLoaded"; readonly page: NotificationPage }
  | { readonly type: "moreLoaded"; readonly page: NotificationPage }
  | { readonly type: "loadMoreFailed" }
  | { readonly type: "liveNotificationReceived"; readonly notification: NotificationItem }
  | { readonly type: "streamFailed" }
  | { readonly type: "markReadRequested"; readonly notificationId: string; readonly readAt: string }
  | {
      readonly type: "markReadReverted";
      readonly notificationId: string;
      readonly previousReadAt: string | null;
    }
  | { readonly type: "markAllReadRequested"; readonly readAt: string }
  | { readonly type: "markAllReadFailed" };

export type NotificationsInbox = InboxState & {
  readonly setFilters: (filters: InboxFilters) => void;
  readonly reload: () => Promise<void>;
  readonly loadMore: () => Promise<void>;
  readonly markRead: (notificationId: string) => Promise<void>;
  readonly markAllRead: () => Promise<void>;
};
