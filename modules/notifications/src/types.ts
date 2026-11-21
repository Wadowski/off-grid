// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { NotificationCategory, NotificationType } from "@offgrid/contracts";
import type { CurrentUserId } from "@offgrid/http";
import type { ModuleDatabase } from "@offgrid/db";
import type { EventBus } from "@offgrid/event-bus";
import type { Logger } from "@offgrid/observability";
import type { FastifyRequest } from "fastify";

export interface NotificationsModuleContext {
  readonly eventBus: EventBus;
  readonly logger: Logger;
  readonly db: ModuleDatabase;
  readonly currentUserId: CurrentUserId;
  readonly verifySession: SessionVerifier;
}

export type SessionVerifier = (
  request: FastifyRequest,
) => Promise<{ userId: string; sessionId: string; accessExpiresAt: Date } | null>;

export interface NotificationRouteContext {
  readonly db: ModuleDatabase;
  readonly currentUserId: CurrentUserId;
  readonly logger: Logger;
  readonly hub: NotificationHub;
  readonly verifySession: SessionVerifier;
  readonly streamHeartbeatMs: number;
}

export interface NotificationStream {
  readonly db: ModuleDatabase;
  readonly hub: NotificationHub;
  readonly verifySession: SessionVerifier;
  readonly logger: Logger;
  readonly userId: string;
  readonly accessExpiresAt: Date;
  readonly heartbeatMs: number;
  readonly lastEventId: LastEventIdHeader;
}

export type StreamSessionState = "active" | "ended" | "unknown";

export type StreamStop = () => void;

export type LastEventIdHeader = string | string[] | undefined;

export type LastEventId =
  | { readonly kind: "absent" }
  | { readonly kind: "invalid" }
  | { readonly kind: "valid"; readonly id: string };

export type MissedNotifications =
  { readonly kind: "replay"; readonly notices: ListedNotification[] } | { readonly kind: "reset" };

export interface ReplayBuffer {
  readonly subscriber: NoticeSubscriber;
  flush(replayedIds: ReadonlySet<string>, target: NoticeSubscriber): Promise<void>;
}

export interface InboxNotice {
  readonly notificationId: string;
  readonly userId: string;
  readonly type: string;
  readonly data: Record<string, string>;
  readonly createdAt: Date;
}

export interface NotificationChannel {
  readonly name: string;
  deliver(notice: InboxNotice): Promise<void>;
}

export interface NotificationsModuleOptions {
  readonly channels?: readonly NotificationChannel[];
  readonly streamHeartbeatMs?: number;
}

export interface NotificationRecord {
  readonly notificationId: string;
  readonly type: NotificationType;
  readonly data: Record<string, string>;
  readonly createdAt: Date;
  readonly readAt: Date | null;
}

export interface ListedNotification {
  readonly id: string;
  readonly type: NotificationType;
  readonly category: NotificationCategory;
  readonly data: Record<string, string>;
  readonly createdAt: string;
  readonly readAt: string | null;
}

export interface NotificationList {
  readonly notifications: ListedNotification[];
  readonly unreadCount: number;
  readonly nextCursor: string | null;
  readonly total: number;
}

export interface NotificationItemRow {
  readonly notificationId: string;
  readonly type: string;
  readonly data: unknown;
  readonly createdAt: Date;
  readonly readAt: Date | null;
}

export interface NotificationCursor {
  readonly createdAt: Date;
  readonly notificationId: string;
}

export interface NotificationPageRequest {
  readonly limit: number;
  readonly cursor?: string;
  readonly category?: NotificationCategory;
  readonly unread?: "true";
}

export interface NotificationFilter {
  readonly types?: readonly NotificationType[];
  readonly unreadOnly: boolean;
}

export interface NoticeSubscriber {
  send(notice: ListedNotification): Promise<void>;
  close(): void;
}

export interface NotificationHub {
  subscribe(userId: string, subscriber: NoticeSubscriber): () => void;
  publish(userId: string, notice: ListedNotification): void;
  close(): void;
}

export type SubscriberPushResult = "queued" | "overflow" | "stopped";

export interface SubscriberQueue {
  push(notice: ListedNotification): SubscriberPushResult;
  stop(): void;
}

export interface SubscriberEntry {
  readonly userId: string;
  readonly subscriber: NoticeSubscriber;
  readonly queue: SubscriberQueue;
}

export interface NotificationsWorkerContext {
  readonly logger: Logger;
}

export interface NotificationsWorker {
  readonly name: string;
  start(): Promise<void>;
  stop(): Promise<void>;
}
