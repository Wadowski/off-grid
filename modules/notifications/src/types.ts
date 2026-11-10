// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CurrentUserId } from "@offgrid/http";
import type { ModuleDatabase } from "@offgrid/db";
import type { EventBus } from "@offgrid/event-bus";
import type { Logger } from "@offgrid/observability";

export interface NotificationsModuleContext {
  readonly eventBus: EventBus;
  readonly logger: Logger;
  readonly db: ModuleDatabase;
  readonly currentUserId: CurrentUserId;
}

export interface NotificationRouteContext {
  readonly db: ModuleDatabase;
  readonly currentUserId: CurrentUserId;
}

export interface InboxNotice {
  readonly notificationId: string;
  readonly userId: string;
  readonly type: string;
  readonly data: Record<string, string>;
}

export interface NotificationChannel {
  readonly name: string;
  deliver(notice: InboxNotice): Promise<void>;
}

export interface NotificationsModuleOptions {
  readonly channels?: readonly NotificationChannel[];
}

export interface NotificationRecord {
  readonly notificationId: string;
  readonly type: string;
  readonly data: Record<string, string>;
  readonly createdAt: Date;
  readonly readAt: Date | null;
}

export interface ListedNotification {
  readonly id: string;
  readonly type: string;
  readonly data: Record<string, string>;
  readonly createdAt: string;
  readonly readAt: string | null;
}

export interface NotificationList {
  readonly notifications: ListedNotification[];
  readonly unreadCount: number;
}
