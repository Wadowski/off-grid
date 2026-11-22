// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { components, paths } from "./generated/schema.js";

export type Notification = components["schemas"]["NotificationList"]["notifications"][number];

export type SseFrame = {
  readonly event: string | undefined;
  readonly id: string | undefined;
  readonly data: string | undefined;
  readonly comments: readonly string[];
};

export type SseParseResult = {
  readonly frames: readonly SseFrame[];
  readonly pending: string;
};

export type LineEnd = {
  readonly end: number;
  readonly next: number;
};

export type NotificationStreamHandlers = {
  readonly onNotification: (notification: Notification) => void;
  readonly onReset: () => void;
  readonly onError: (error: Error) => void;
};

export type SubscribeNotificationsOptions = NotificationStreamHandlers & {
  readonly baseUrl: string;
  readonly fetch?: typeof fetch;
  readonly signal: AbortSignal;
  readonly random?: () => number;
};

export type StreamOutcome = "ended" | "unauthorized" | "aborted";

export type ByteBody = Uint8Array<ArrayBuffer> | Blob;

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiClientOptions = {
  baseUrl: string;
  fetch?: typeof fetch;
};

export type ApiClient = {
  readonly request: (
    method: HttpMethod,
    path: string,
    body?: unknown,
    headers?: Readonly<Record<string, string>>,
  ) => Promise<unknown>;
  readonly requestBytes: (
    method: HttpMethod,
    path: string,
    body: ByteBody,
    headers?: Readonly<Record<string, string>>,
    contentType?: string | null,
  ) => Promise<unknown>;
};

export type FileListOptions = {
  readonly cursor?: string;
  readonly limit?: number;
};

export type NotificationListOptions = NonNullable<
  paths["/me/notifications"]["get"]["parameters"]["query"]
>;

export type SignInInput = {
  readonly email: string;
  readonly password: string;
  readonly rememberMe?: boolean;
  readonly deviceLabel?: string;
};

export type RegisterInput = {
  readonly displayName: string;
  readonly email: string;
  readonly password: string;
};

export type UpdateProfileInput = {
  readonly displayName: string;
};

export type ChangePasswordInput = {
  readonly currentPassword: string;
  readonly newPassword: string;
};

export type PasswordConfirmationInput = {
  readonly password: string;
};

export type StreamAttempt = {
  readonly outcome: StreamOutcome;
  readonly lastId: string | undefined;
  readonly receivedFrame: boolean;
  readonly error: Error | undefined;
};
